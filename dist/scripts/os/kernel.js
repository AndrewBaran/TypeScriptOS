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
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.

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
            this.krnTrace(_krnKeyboardDriver.status);

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

            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();

            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("Ending the shutdown of OS");
        };

        Kernel.prototype.krnOnCPUClockPulse = function () {
            // Check for an interrupt
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) {
                try  {
                    _CPU.cycle();
                } catch (error) {
                    _StdOut.putText("Error occured: " + error.message + ". Shutting down PID " + _CurrentPCB.processID);
                    _StdOut.newLine();

                    this.krnTrace("Error occured! Program must be shut down.");

                    _CPU.removeProgram();
                }
            } else {
                this.krnTrace("Idle");
            }
        };

        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            switch (irq) {
                case _Constants.TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;

                case _Constants.KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;

                case _Constants.SYSTEM_CALL_IRQ:
                    this.systemCall();
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
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
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
            // 01 in X reg = print integer stored in Y register
            if ((_CPU.Xreg.toString(10)) === "1") {
                _StdOut.putText(_CPU.Yreg.toString(10));
                _StdOut.newLine();
            } else if ((_CPU.Xreg.toString(10)) === "2") {
                var currentPC = _CPU.Yreg;
                var data = "";

                var printString = "";

                while ((data = _MemoryManager.getByte(currentPC, _CurrentPCB.processID)) !== "00") {
                    var dataValue = parseInt(data, 16);

                    printString += String.fromCharCode(dataValue);

                    currentPC++;
                }

                _StdOut.putText(printString);
                _StdOut.newLine();
            } else {
                TSOS.Control.hostLog("Attention! CPU state did not match any known system call.");
            }
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

                    var hexValue = TSOS.Utils.decimalToHex(decimalValue);

                    var cell = newRow.insertCell(j);
                    cell.innerHTML = hexValue;
                }
            }
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
