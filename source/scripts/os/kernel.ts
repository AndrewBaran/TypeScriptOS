/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap(): void {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace("Keyboard driver: " + _krnKeyboardDriver.status);

            // Load the File System Device Driver
            this.krnTrace("Loading the file system device driver.");
            _KrnFileSystemDriver = new DeviceDriverFileSystem();
            _KrnFileSystemDriver.driverEntry();
            _KrnFileSystemDriver.initializeStorage();
            _KrnFileSystemDriver.displayFileSystem();
            this.krnTrace("File system driver: " + _KrnFileSystemDriver.status);


            // Initialize and display memory
            this.krnTrace("Initializing and displaying memory.");
            _MemoryManager = new MemoryManager();
            _MemoryManager.initializeMemory();
            _MemoryManager.displayMemory();
            
            // Display CPU status
            this.krnTrace("Displaying CPU");
            _CPU.display();

            // Initialize new PCB list
            this.krnTrace("Initializing the resident and ready queues.");
            _ResidentQueue = [];
            _ReadyQueue = new Queue();

            // Initialize CPU scheduler
            this.krnTrace("Initializing the CPU scheduler.");
            _Scheduler = new Scheduler();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Add timer to the host log
            this.krnTrace("Enabling host display clock.");
            Control.displayTimer();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown(): void {

            this.krnTrace("Begin shutdown of OS.");

            this.krnTrace("Clearing memory.");
            _MemoryManager.clearMemory();

            this.krnTrace("Clearing CPU.");
            _CPU.clear();
            _CPU.isExecuting = false;

            // Clear ready queue and resident queue
            this.krnTrace("Clearing resident queue.");
            _ResidentQueue = [];

            this.krnTrace("Clearing ready queue.");
            _ReadyQueue.q = [];

            // Reload displays with blank entries
            Control.updateDisplays();

            // Else, disable the Interrupts
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            
            // Unload the Device Drivers?

            this.krnTrace("Ending the shutdown of OS");
        }


        public krnOnCPUClockPulse(): void {

            // Check for an interrupt
            if (_KernelInterruptQueue.getSize() > 0) {

                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } 

            // No interrupts, then run one CPU cycle if there is a program executing
            // Uses try-catch, as we want exception to propogate up call stack 
            // instead of executing current instruction and then erroring out
            else if (_CPU.isExecuting) {

                // Catch any memory access exceptions
                try {
                    _CPU.cycle();
                }

                catch(error) {

                    _StdOut.putText("Error occured: " + error.message + ". Removing PID " + _CurrentPCB.processID);
                    _StdOut.newLine();

                    this.krnTrace("Error occured! Program must be shut down.");

                    _CPU.removeProgram();
                }

                finally {
                    Control.updateDisplays();
                }
            }

            // No interrupts and no programs running, so just idle
            else {
                this.krnTrace("Idle");
            }

        }

        //
        // Interrupt Handling
        //
        public krnEnableInterrupts(): void {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();

            // TODO File System

        }

        public krnDisableInterrupts(): void {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params): void {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ " + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case _InterruptConstants.TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;

                case _InterruptConstants.KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;

                case _InterruptConstants.SYSTEM_CALL_IRQ:
                    this.systemCall();
                    break;

                case _InterruptConstants.CONTEXT_SWITCH_IRQ:
                    this.contextSwitch();
                    break;

                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR(): void {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string): void {

             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {

                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0 || Control.singleStepEnabled) {
                        Control.hostLog(msg, "OS");
                    }
                } 

                else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg): void {
            Control.hostLog("OS ERROR - TRAP: " + msg);

            _OsShell.shellBSOD();
            this.krnShutdown();
        }

        // Performs a system call, depending on the contents of the X register
        public systemCall(): void {

            // Flip the mode bit
            _Mode_Bit = _Modes.KERNEL;

            // 01 in X reg = print integer stored in Y register
            if((_CPU.Xreg.toString(10)) === "1") {

                _StdOut.putText(_CPU.Yreg.toString(10));
                _StdOut.newLine();
            }

            // 02 in X reg = print the 00-terminated string stored at the address in the Y register
            else if((_CPU.Xreg.toString(10)) === "2") {

                var currentPC: number = _CPU.Yreg;
                var data: string = "";

                var printString: string = "";

                while((data = _MemoryManager.getByte(currentPC, _CurrentPCB.memorySlot)) !== "00") {

                    var dataValue: number = parseInt(data, 16);
                    
                    printString += String.fromCharCode(dataValue);

                    currentPC++;
                }

                _StdOut.putText(printString);
                _StdOut.newLine();
            }

            // Invalid system call
            else {

                Control.hostLog("Attention! CPU state did not match any known system call.");
            }

            // Flip mode bit back
            _Mode_Bit = _Modes.USER;

        } // systemCall()

        public displayReadyQueue(): void {

            var readyTable = <HTMLTableElement>document.getElementById("tableReadyQueue");

            // Delete any existing data in table
            while(readyTable.rows.length > 1) {
                readyTable.deleteRow(-1);
            }

            var tableRowLength = (<HTMLTableRowElement>readyTable.rows[0]).cells.length;

            for(var i: number = 0; i < _ReadyQueue.getSize(); i++) {

                var currentPCB: TSOS.PCB = _ReadyQueue.q[i];

                var newRow = <HTMLTableRowElement>readyTable.insertRow();

                for(var j: number = 0; j < tableRowLength; j++) {

                    var key: string = Object.keys(currentPCB)[j];
                    var decimalValue: number = parseInt(currentPCB[key], 10);

                    var value: string = Utils.decimalToHex(decimalValue);

                    // Don't display PID, Z-flag, or Priority in hex
                    if(key === "processID" || key === "Zflag" || key === "priority") {
                        value = decimalValue.toString(10);
                    }

                    // Display status and location as strings
                    if(key === "status" || key === "location") {
                        value = currentPCB[key];
                    }

                    var cell = newRow.insertCell(j);
                    cell.innerHTML = value;

                } // Inner for

            }// Outer for

        } // displayReadyQueue

        // Switches from one running process to another, saving and loading info accordingly
        private contextSwitch(): void {

            // Flip the mode bit
            _Mode_Bit = _Modes.KERNEL;

            this.krnTrace("Executing a context switch.");

            if(_Scheduler.inUse) {

                switch(_Scheduler.getSchedulingType()) {

                    case "rr":

                        // Reset quantum for next process
                        _Scheduler.resetQuantum();

                        break;

                    case "fcfs":

                        break;

                    case "priority":

                        break;

                    default:

                        console.log("Shouldn't happen");
                        break;

                } // switch
                
            }

            // Save PCB
            _CurrentPCB.saveInfo();
            this.krnTrace("Saving state of PID " + _CurrentPCB.processID);

            // Remove currentPCB from ready queue
            _ReadyQueue.dequeue();

            if(_CurrentPCB.status !== _ProcessStates.FINISHED) {

                // Add PCB to end of ready queue
                _CurrentPCB.status = _ProcessStates.READY;
                _ReadyQueue.enqueue(_CurrentPCB);
            }

            // Load new PCB if more than one PCB in queue
            if(_ReadyQueue.getSize() > 0) {

                // Get item at front of queue, don't remove
                _CurrentPCB = _ReadyQueue.peek();

                if(_CurrentPCB.location === _Locations.DISK) {

                    console.log("_CurrentPCB is on disk.");

                    // Place item at end of queue onto disk
                    var lastPCB: TSOS.PCB = _ReadyQueue.q[_ReadyQueue.getSize() - 1];
                    var memorySlot: number = lastPCB.memorySlot;

                    // Swap out, as lastPCB is in memory
                    if(_ReadyQueue.getSize() > 1 && lastPCB.location === _Locations.MEMORY) {

                        console.log("Can swap with lastPCB, which is in memory.");
                        
                        // Roll lastPCB in the queue to the disk
                        this.programRollOut(lastPCB.processID, false);

                        // Update its flags
                        lastPCB.location = _Locations.DISK;
                        lastPCB.memorySlot = -1;
                        lastPCB.baseRegister = 0;
                        lastPCB.limitRegister = 0;

                        // Place it back in the queue
                        _ReadyQueue.q[_ReadyQueue.getSize() - 1] = lastPCB;
                    }

                    // Both are on disk
                    else if(_ReadyQueue.getSize() > 1 && lastPCB.location === _Locations.DISK) {

                        console.log("LastPCB is on disk, so look for an opening.");

                        var pcbToReplaceFound: boolean = false;

                        for(var i: number = 1; i < (_ReadyQueue.getSize() - 1); i++) {

                            var pcbToReplace: TSOS.PCB = _ReadyQueue.q[i];

                            if(pcbToReplace.location === _Locations.MEMORY) {

                                pcbToReplaceFound = true;
                                break;
                            }
                        }

                        // Found PCB in memory to replace
                        if(pcbToReplaceFound) {

                            console.log("Found PCB to replace in memory");

                            memorySlot = pcbToReplace.memorySlot;
                            console.log("Replacing slot " + memorySlot);

                            this.programRollOut(pcbToReplace.processID, false);

                            // Update its flags
                            pcbToReplace.location = _Locations.DISK;
                            pcbToReplace.memorySlot = -1;
                            pcbToReplace.baseRegister = 0;
                            pcbToReplace.limitRegister = 0;

                            // Put back in queue
                            _ReadyQueue.q[i] = pcbToReplace;

                        }

                        // All processes on disk
                        else {

                            console.log("All PCBs on disk.");

                            var randomSlot: number = Math.floor(Math.random() * _MemoryManager.programsInUse.length);

                            memorySlot = randomSlot;
                            _MemoryManager.programsInUse[memorySlot] = 1;

                        }

                    } // Both PCBs were on disk

                    else {

                        console.log("Only one in queue and this PCB is on disk.");

                        // Since only one left in queue, pick a random slot in memory to load into
                        var randomSlot: number = Math.floor(Math.random() * _MemoryManager.programsInUse.length);

                        memorySlot = randomSlot;
                        _MemoryManager.programsInUse[memorySlot] = 1;

                        console.log("Loading program on disk into memory slot " + memorySlot);
                    }


                    // Update its flags
                    _CurrentPCB.location = _Locations.MEMORY;
                    _CurrentPCB.memorySlot = memorySlot;
                    _CurrentPCB.baseRegister = memorySlot * _MemoryConstants.PROCESS_SIZE;
                    _CurrentPCB.limitRegister = _CurrentPCB.baseRegister + _MemoryConstants.PROCESS_SIZE - 1;
                    
                    console.log("Base reg: " + _CurrentPCB.baseRegister);
                    console.log("Limit reg: " + _CurrentPCB.limitRegister);
                    console.log("Memory slot: " + memorySlot);

                    // Place it (_CurrentPCB) back on the ready queue
                    _ReadyQueue.q[0] = _CurrentPCB;

                    console.log("Rolling " + _CurrentPCB.processID + " into memory.");
                    
                    // Roll the program on disk (_CurrentPCB) to memory
                    this.programRollIn(_CurrentPCB.processID, memorySlot, false);
                }

                // Load new CPU state
                _CPU.loadState(_CurrentPCB);
                this.krnTrace("Process state of PID " + _CurrentPCB.processID + " loaded.");

                // Set state to running
                _CurrentPCB.status = _ProcessStates.RUNNING;
            }

            else {

                // Stop CPU from executing
                _CPU.isExecuting = false;
                this.krnTrace("No more programs to run.");

                // Reset scheduling flag
                _Scheduler.inUse = false;
            }

            // Load displays
            Control.updateDisplays();
            _KrnFileSystemDriver.displayFileSystem();

            // Flip mode bit back
            _Mode_Bit = _Modes.USER;

        } // contextSwitch()

        // Moves a process's memory contents to the disk
        public programRollOut(processID: number, runCalled: boolean = false): boolean {

            // If run command used
            if(runCalled) {

                console.log("Run command used. Look at resident queue.");

                // Check if processID corresponds to a PCB in the resident queue
                var pcbFound: boolean = false;

                for(var i: number = 0; i < _ResidentQueue.length; i++) {

                    var currentPCB: TSOS.PCB = _ResidentQueue[i];

                    if(currentPCB.processID === processID) {

                    	console.log("PCB found.");
                    	pcbFound = true;
                    	break;
                    }
                }

                if(pcbFound) {

					var fileName: string = "process" + processID + ".swp";

                    _KrnFileSystemDriver.createFile(fileName, true);

                    // Denote swap file as a hidden file
                    fileName = "." + fileName;

                    // Write PCB memory contents to swap file
                    var memoryContents: string = _MemoryManager.getMemoryContents(processID);
                    _KrnFileSystemDriver.writeFile(fileName, memoryContents);

                    _Kernel.krnTrace("Wrote contents of PID " + processID + " to disk in file " + fileName + ".");

                    // Set this PCB to on disk
                    currentPCB.location = _Locations.DISK;

                    // Update PCB in the resident queue
                    _ResidentQueue[i] = currentPCB;

                    _KrnFileSystemDriver.displayFileSystem();

                    // Keep track of the pids
                    _MemoryManager.pidsOnDisk.push(processID);

                    return true;
                }

                else {

                	this.krnTrace("Error! PID " + processID + " not found in memory.");

                	return false;
                }

            } // run command

            // If runall command used
            else {

                console.log("Runall command used. Look at ready queue.");

                // Check if processID corresponds to a PCB in the Ready queue
                var pcbFound: boolean = false;

                for(var i: number = 0; i < _ReadyQueue.getSize(); i++) {

                    var currentPCB: TSOS.PCB = _ReadyQueue.q[i];

                    if(currentPCB.processID === processID) {
                        
                        console.log("PCB found.");
                        pcbFound = true;
                        break;
                    }
                } 

                if(pcbFound) {

                    var fileName: string = "process" + processID + ".swp";

                    _KrnFileSystemDriver.createFile(fileName, true);

                    // Denote swap file as a hidden file
                    fileName = "." + fileName;

                    // Write PCB memory contents to swap file
                    var memoryContents: string = _MemoryManager.getMemoryContents(processID);
                    _KrnFileSystemDriver.writeFile(fileName, memoryContents);

                    _Kernel.krnTrace("Wrote contents of PID " + processID + " to disk in file " + fileName + ".");

                    console.log("Writen to file " + fileName);
                    console.log("Contents of file: " + memoryContents);

                    // Set this PCB to on disk
                    currentPCB.location = _Locations.DISK;

                    // Store PCB back in ready queue
                    _ReadyQueue.q[i] = currentPCB;

                    _KrnFileSystemDriver.displayFileSystem();

                    return true;
                }

                // PCB was not found
                else {

                    this.krnTrace("Error! PID " + processID + " not found in memory.");
                    return false;
                }

            } // runall command

        } // programRollOut()

        // Moves a process stored on the disk into memory
        public programRollIn(processID: number, memorySlot: number, runCalled: boolean = false): boolean {

            var pcbFound: boolean = false;

            // Get list of files on the disk
            var desiredFileName: string = ".process" + processID.toString(10) + ".swp";
            var fileNames: string[] = _KrnFileSystemDriver.getFileNames();

            console.log("Desired file name: " + desiredFileName);
            console.log("File names on disk: " + fileNames);

            for(var i: number = 0; i < fileNames.length; i++) {

                if(fileNames[i] === desiredFileName) {

                    pcbFound = true;
                    break;
                }
            }

            if(pcbFound) {

                console.log("Found the PCB");

                // Read the contents of disk into string
                var memoryContents: string = _KrnFileSystemDriver.readFile(desiredFileName);
                console.log("Reading from file " + desiredFileName);
                console.log("Contents of file: " + memoryContents);

                console.log("Length of memory: " + memoryContents.length);

                // Parse contents back into memory
                var byteList: string [] = [];

                for(var i: number = 0; i < memoryContents.length; i = i + 2) {

                    var currentByte: string = memoryContents[i] + memoryContents[i + 1];

                    byteList.push(currentByte);
                }

                console.log("Placing PID " + processID + " into memory.");
                console.log(byteList);

                // Put process memory into main memory
                _MemoryManager.putMemoryContents(byteList, memorySlot);

                // Delete the swap file
                _KrnFileSystemDriver.deleteFile(desiredFileName);

                // Remove tracking of pid
                for(var i: number = 0; i < _MemoryManager.pidsOnDisk.length; i++) {

                    if(_MemoryManager.pidsOnDisk[i] === processID) {

                        // Remove pid from the tracker
                        _MemoryManager.pidsOnDisk.splice(i, 1);
                    }
                }

                this.krnTrace("PID " + processID + " moved from disk to memory at slot #" + memorySlot + ".");
                return true;
            }

            else {

                this.krnTrace("Error! PID " + processID + " not found on disk.");
                return false;
            }

        } // programRollIn()

    }
}
