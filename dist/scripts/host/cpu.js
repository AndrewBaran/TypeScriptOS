///<reference path="../globals.ts" />
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // Check if first cycle
            if (_CurrentPCB.cyclesComplete === 0) {
                // Setup stuff
                console.log("Setting up CPU for first cycle");
            }

            // Check if the PC is valid
            if (this.PC >= 0 && this.PC < _MemoryConstants.PROCESS_SIZE) {
                // Get real instruction from memory
                var nextInstruction = _MemoryManager.getByte(this.PC, _CurrentPCB.processID);

                console.log("Instruction: " + nextInstruction);
            } else {
                // Destroy program; BSOD; kernel panic
            }

            switch (nextInstruction) {
                case "A9":
                    console.log("LDA");

                    break;

                case "AD":
                    console.log("LDA");

                    break;

                case "8D":
                    console.log("SDA");

                    break;

                case "6D":
                    console.log("ADC");

                    break;

                case "A2":
                    console.log("LDX");

                    break;

                case "AE":
                    console.log("LDX");

                    break;

                case "A0":
                    console.log("LDY");

                    break;

                case "AC":
                    console.log("LDY");

                    break;

                case "EA":
                    console.log("NOP");

                    break;

                case "00":
                    console.log("BRK");
                    console.log("Program finished.");

                    // Program is complete; stop CPU
                    this.isExecuting = false;

                    // Display PCB in console
                    _CurrentPCB.display();

                    break;

                case "EC":
                    console.log("CPX");

                    break;

                case "D0":
                    console.log("BNE");

                    break;

                case "EE":
                    console.log("INC");

                    break;

                case "FF":
                    console.log("SYS");

                    break;
            }

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // TODO Program execution goes here
            // TODO Remove
            // Increment PC
            this.PC++;

            // Increment number of cycles done
            _CurrentPCB.cyclesComplete++;

            // Update CPU display
            TSOS.Display.displayCPU();

            // Save PCB information
            _CurrentPCB.saveInfo();
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
