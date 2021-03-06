/* ------------
Kernel.ts
Requires globals.ts
Routines for the Operating System, NOT the host.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("Bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace("Keyboard driver: " + _krnKeyboardDriver.status);

            // Load the File System Device Driver
            this.krnTrace("Loading the file system device driver.");
            _KrnFileSystemDriver = new TSOS.DeviceDriverFileSystem();
            _KrnFileSystemDriver.driverEntry();
            _KrnFileSystemDriver.initializeStorage();
            _KrnFileSystemDriver.displayFileSystem();
            this.krnTrace("File system driver: " + _KrnFileSystemDriver.status);

            // Initialize and display memory
            this.krnTrace("Initializing and displaying memory.");
            _MemoryManager = new TSOS.MemoryManager();
            _MemoryManager.initializeMemory();
            _MemoryManager.displayMemory();

            // Display CPU status
            this.krnTrace("Displaying CPU");
            _CPU.display();

            // Initialize new PCB list
            this.krnTrace("Initializing the resident and ready queues.");
            _ResidentQueue = [];
            _ReadyQueue = new TSOS.Queue();

            // Initialize CPU scheduler
            this.krnTrace("Initializing the CPU scheduler.");
            _Scheduler = new TSOS.Scheduler();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();

            // Add timer to the host log
            this.krnTrace("Enabling host display clock.");
            TSOS.Control.displayTimer();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };

        Kernel.prototype.krnShutdown = function () {
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
            TSOS.Control.updateDisplays();

            // Else, disable the Interrupts
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();

            // Unload the Device Drivers?
            this.krnTrace("Ending the shutdown of OS");
        };

        Kernel.prototype.krnOnCPUClockPulse = function () {
            // Check for an interrupt
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) {
                try  {
                    _CPU.cycle();
                } catch (error) {
                    _StdOut.putText("Error occured: " + error.message + ". Removing PID " + _CurrentPCB.processID);
                    _StdOut.newLine();

                    this.krnTrace("Error occured! Program must be shut down.");

                    _CPU.removeProgram();
                } finally {
                    TSOS.Control.updateDisplays();
                }
            } else {
                this.krnTrace("Idle");
            }
        };

        // Interrupt Handling
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
        };

        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ " + irq);

            switch (irq) {
                case _InterruptConstants.TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;

                case _InterruptConstants.KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
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
        };

        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };

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
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0 || TSOS.Control.singleStepEnabled) {
                        TSOS.Control.hostLog(msg, "OS");
                    }
                } else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };

        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);

            _OsShell.shellBSOD();
            this.krnShutdown();
        };

        // Performs a system call, depending on the contents of the X register
        Kernel.prototype.systemCall = function () {
            // Flip the mode bit
            _Mode_Bit = _Modes.KERNEL;

            // 01 in X reg = print integer stored in Y register
            if ((_CPU.Xreg.toString(10)) === "1") {
                _StdOut.putText(_CPU.Yreg.toString(10));
                _StdOut.newLine();
            } else if ((_CPU.Xreg.toString(10)) === "2") {
                var currentPC = _CPU.Yreg;
                var data = "";

                var printString = "";

                while ((data = _MemoryManager.getByte(currentPC, _CurrentPCB.memorySlot)) !== "00") {
                    var dataValue = parseInt(data, 16);

                    printString += String.fromCharCode(dataValue);

                    currentPC++;
                }

                _StdOut.putText(printString);
                _StdOut.newLine();
            } else {
                TSOS.Control.hostLog("Attention! CPU state did not match any known system call.");
            }

            // Flip mode bit back
            _Mode_Bit = _Modes.USER;
        };

        Kernel.prototype.displayReadyQueue = function () {
            var readyTable = document.getElementById("tableReadyQueue");

            while (readyTable.rows.length > 1) {
                readyTable.deleteRow(-1);
            }

            var tableRowLength = readyTable.rows[0].cells.length;

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                var currentPCB = _ReadyQueue.q[i];

                var newRow = readyTable.insertRow();

                for (var j = 0; j < tableRowLength; j++) {
                    var key = Object.keys(currentPCB)[j];
                    var decimalValue = parseInt(currentPCB[key], 10);

                    var value = TSOS.Utils.decimalToHex(decimalValue);

                    // Don't display PID, Z-flag, or Priority in hex
                    if (key === "processID" || key === "Zflag" || key === "priority") {
                        value = decimalValue.toString(10);
                    }

                    // Display status and location as strings
                    if (key === "status" || key === "location") {
                        value = currentPCB[key];
                    }

                    var cell = newRow.insertCell(j);
                    cell.innerHTML = value;
                }
            }
        };

        // Switches from one running process to another, saving and loading info accordingly
        Kernel.prototype.contextSwitch = function () {
            // Flip the mode bit
            _Mode_Bit = _Modes.KERNEL;

            this.krnTrace("Executing a context switch.");

            if (_Scheduler.inUse) {
                switch (_Scheduler.getSchedulingType()) {
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
                }
            }

            // Save PCB
            _CurrentPCB.saveInfo();
            this.krnTrace("Saving state of PID " + _CurrentPCB.processID);

            // Remove currentPCB from ready queue
            _ReadyQueue.dequeue();

            if (_CurrentPCB.status !== _ProcessStates.FINISHED) {
                // Add PCB to end of ready queue
                _CurrentPCB.status = _ProcessStates.READY;
                _ReadyQueue.enqueue(_CurrentPCB);
            }

            // Load new PCB if more than one PCB in queue
            if (_ReadyQueue.getSize() > 0) {
                // Get item at front of queue, don't remove
                _CurrentPCB = _ReadyQueue.peek();

                if (_CurrentPCB.location === _Locations.DISK) {
                    // Place item at end of queue onto disk
                    var lastPCB = _ReadyQueue.q[_ReadyQueue.getSize() - 1];
                    var memorySlot = lastPCB.memorySlot;

                    // Swap out, as lastPCB is in memory
                    if (_ReadyQueue.getSize() > 1 && lastPCB.location === _Locations.MEMORY) {
                        // Roll lastPCB in the queue to the disk
                        this.programRollOut(lastPCB.processID, false);

                        // Update its flags
                        lastPCB.location = _Locations.DISK;
                        lastPCB.memorySlot = -1;
                        lastPCB.baseRegister = 0;
                        lastPCB.limitRegister = 0;

                        // Place it back in the queue
                        _ReadyQueue.q[_ReadyQueue.getSize() - 1] = lastPCB;
                    } else if (_ReadyQueue.getSize() > 1 && lastPCB.location === _Locations.DISK) {
                        var pcbToReplaceFound = false;

                        for (var i = 1; i < (_ReadyQueue.getSize() - 1); i++) {
                            var pcbToReplace = _ReadyQueue.q[i];

                            if (pcbToReplace.location === _Locations.MEMORY) {
                                pcbToReplaceFound = true;
                                break;
                            }
                        }

                        // Found PCB in memory to replace
                        if (pcbToReplaceFound) {
                            memorySlot = pcbToReplace.memorySlot;

                            this.programRollOut(pcbToReplace.processID, false);

                            // Update its flags
                            pcbToReplace.location = _Locations.DISK;
                            pcbToReplace.memorySlot = -1;
                            pcbToReplace.baseRegister = 0;
                            pcbToReplace.limitRegister = 0;

                            // Put back in queue
                            _ReadyQueue.q[i] = pcbToReplace;
                        } else {
                            var randomSlot = Math.floor(Math.random() * _MemoryManager.programsInUse.length);

                            memorySlot = randomSlot;
                            _MemoryManager.programsInUse[memorySlot] = 1;
                        }
                    } else {
                        // Since only one left in queue, pick a random slot in memory to load into
                        var randomSlot = Math.floor(Math.random() * _MemoryManager.programsInUse.length);

                        memorySlot = randomSlot;
                        _MemoryManager.programsInUse[memorySlot] = 1;
                    }

                    // Update its flags
                    _CurrentPCB.location = _Locations.MEMORY;
                    _CurrentPCB.memorySlot = memorySlot;
                    _CurrentPCB.baseRegister = memorySlot * _MemoryConstants.PROCESS_SIZE;
                    _CurrentPCB.limitRegister = _CurrentPCB.baseRegister + _MemoryConstants.PROCESS_SIZE - 1;

                    // Place it (_CurrentPCB) back on the ready queue
                    _ReadyQueue.q[0] = _CurrentPCB;

                    // Roll the program on disk (_CurrentPCB) to memory
                    this.programRollIn(_CurrentPCB.processID, memorySlot, false);
                }

                // Load new CPU state
                _CPU.loadState(_CurrentPCB);
                this.krnTrace("Process state of PID " + _CurrentPCB.processID + " loaded.");

                // Set state to running
                _CurrentPCB.status = _ProcessStates.RUNNING;
            } else {
                // Stop CPU from executing
                _CPU.isExecuting = false;
                this.krnTrace("No more programs to run.");

                // Reset scheduling flag
                _Scheduler.inUse = false;
            }

            // Load displays
            TSOS.Control.updateDisplays();
            _KrnFileSystemDriver.displayFileSystem();

            // Flip mode bit back
            _Mode_Bit = _Modes.USER;
        };

        // Moves a process's memory contents to the disk
        Kernel.prototype.programRollOut = function (processID, runCalled) {
            if (typeof runCalled === "undefined") { runCalled = false; }
            // If run command used
            if (runCalled) {
                // Check if processID corresponds to a PCB in the resident queue
                var pcbFound = false;

                for (var i = 0; i < _ResidentQueue.length; i++) {
                    var currentPCB = _ResidentQueue[i];

                    if (currentPCB.processID === processID) {
                        pcbFound = true;
                        break;
                    }
                }

                if (pcbFound) {
                    var fileName = "process" + processID + ".swp";

                    _KrnFileSystemDriver.createFile(fileName, true);

                    // Denote swap file as a hidden file
                    fileName = "." + fileName;

                    // Write PCB memory contents to swap file
                    var memoryContents = _MemoryManager.getMemoryContents(processID);
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
                } else {
                    this.krnTrace("Error! PID " + processID + " not found in memory.");

                    return false;
                }
            } else {
                // Check if processID corresponds to a PCB in the Ready queue
                var pcbFound = false;

                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                    var currentPCB = _ReadyQueue.q[i];

                    if (currentPCB.processID === processID) {
                        pcbFound = true;
                        break;
                    }
                }

                if (pcbFound) {
                    var fileName = "process" + processID + ".swp";

                    _KrnFileSystemDriver.createFile(fileName, true);

                    // Denote swap file as a hidden file
                    fileName = "." + fileName;

                    // Write PCB memory contents to swap file
                    var memoryContents = _MemoryManager.getMemoryContents(processID);
                    _KrnFileSystemDriver.writeFile(fileName, memoryContents);

                    _Kernel.krnTrace("Wrote contents of PID " + processID + " to disk in file " + fileName + ".");

                    // Set this PCB to on disk
                    currentPCB.location = _Locations.DISK;

                    // Store PCB back in ready queue
                    _ReadyQueue.q[i] = currentPCB;

                    _KrnFileSystemDriver.displayFileSystem();

                    return true;
                } else {
                    this.krnTrace("Error! PID " + processID + " not found in memory.");
                    return false;
                }
            }
        };

        // Moves a process stored on the disk into memory
        Kernel.prototype.programRollIn = function (processID, memorySlot, runCalled) {
            if (typeof runCalled === "undefined") { runCalled = false; }
            var pcbFound = false;

            // Get list of files on the disk
            var desiredFileName = ".process" + processID.toString(10) + ".swp";
            var fileNames = _KrnFileSystemDriver.getFileNames();

            for (var i = 0; i < fileNames.length; i++) {
                if (fileNames[i] === desiredFileName) {
                    pcbFound = true;
                    break;
                }
            }

            if (pcbFound) {
                // Read the contents of disk into string
                var memoryContents = _KrnFileSystemDriver.readFile(desiredFileName);

                // Parse contents back into memory
                var byteList = [];

                for (var i = 0; i < memoryContents.length; i = i + 2) {
                    var currentByte = memoryContents[i] + memoryContents[i + 1];

                    byteList.push(currentByte);
                }

                // Put process memory into main memory
                _MemoryManager.putMemoryContents(byteList, memorySlot);

                // Delete the swap file
                _KrnFileSystemDriver.deleteFile(desiredFileName);

                for (var i = 0; i < _MemoryManager.pidsOnDisk.length; i++) {
                    if (_MemoryManager.pidsOnDisk[i] === processID) {
                        // Remove pid from the tracker
                        _MemoryManager.pidsOnDisk.splice(i, 1);
                    }
                }

                this.krnTrace("PID " + processID + " moved from disk to memory at slot #" + memorySlot + ".");
                return true;
            } else {
                this.krnTrace("Error! PID " + processID + " not found on disk.");
                return false;
            }
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
