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
            this.krnTrace(_krnKeyboardDriver.status);

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
            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
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

                try {
                    _CPU.cycle();
                }

                catch(error) {

                    _StdOut.putText("Error occured: " + error.message + ". Shutting down PID " + _CurrentPCB.processID);
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
            // Put more here.
        }

        public krnDisableInterrupts(): void {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params): void {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

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

                while((data = _MemoryManager.getByte(currentPC, _CurrentPCB.processID)) !== "00") {

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

                    var hexValue: string = Utils.decimalToHex(decimalValue);

                    var cell = newRow.insertCell(j);
                    cell.innerHTML = hexValue;

                } // Inner for

            }// Outer for

        } // displayReadyQueue

        // Switches from one running process to another, saving and loading info accordingly
        private contextSwitch(): void {

            console.log("In contextSwitch");
        }

    }
}
