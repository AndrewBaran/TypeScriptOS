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
                // Clear CPU
                this.clear();
            }

            // Check if the PC is valid
            if (this.PC >= 0 && this.PC < _MemoryConstants.PROCESS_SIZE) {
                // Get real instruction from memory
                var nextInstruction = _MemoryManager.getByte(this.PC, _CurrentPCB.processID);
            } else {
                // TODO Probably better to remove program instead
                _Kernel.krnTrapError("Error! PC must be in range: 0 <= PC <= " + _MemoryConstants.PROCESS_SIZE);
            }

            // Convert PC to decimal equivalent
            var decimalPC = this.PC.toString(10);
            this.PC = parseInt(decimalPC, 10);

            // Increment PC to point to next byte (could be instruction or data)
            this.PC++;

            // Increment number of cycles done
            _CurrentPCB.cyclesComplete++;

            var instructionData = [];

            switch (nextInstruction) {
                case "A9":
                    console.log("LDA");

                    // Read 1 data byte
                    instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                    var hexString = instructionData.pop();
                    var hexValue = parseInt(hexString, 16);

                    // Load accumulator with constant
                    this.Acc = hexValue;

                    // Increment PC
                    this.PC++;

                    break;

                case "AD":
                    console.log("LDA");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var stringValue = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue = parseInt(stringValue, 16);

                    this.Acc = hexValue;

                    this.PC += 2;

                    break;

                case "8D":
                    console.log("STA");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    _MemoryManager.writeData(memoryAddress, _CPU.Acc, _CurrentPCB.processID);

                    this.PC += 2;

                    break;

                case "6D":
                    console.log("ADC");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var stringValue = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue = parseInt(stringValue, 16);

                    // Add to accumulator
                    this.Acc += hexValue;

                    this.PC += 2;

                    break;

                case "A2":
                    console.log("LDX");

                    // Read 1 data byte
                    instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                    var hexString = instructionData.pop();
                    var hexValue = parseInt(hexString, 16);

                    this.Xreg = hexValue;

                    this.PC++;

                    break;

                case "AE":
                    console.log("LDX");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var hexString = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue = parseInt(hexString, 16);

                    // Load Yreg
                    this.Xreg = hexValue;

                    this.PC += 2;

                    break;

                case "A0":
                    console.log("LDY");

                    // Read 1 data byte
                    instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                    var hexString = instructionData.pop();
                    var hexValue = parseInt(hexString, 16);

                    this.Yreg = hexValue;

                    this.PC++;

                    break;

                case "AC":
                    console.log("LDY");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var hexString = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue = parseInt(hexString, 16);

                    // Load Yreg
                    this.Yreg = hexValue;

                    this.PC += 2;

                    break;

                case "EA":
                    console.log("NOP");

                    break;

                case "00":
                    console.log("BRK");

                    this.removeProgram();

                    break;

                case "EC":
                    console.log("CPX");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var hexString = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue = parseInt(hexString, 16);

                    // Set Zflag if equal
                    if (hexValue === this.Xreg) {
                        this.Zflag = 1;
                    } else {
                        this.Zflag = 0;
                    }

                    this.PC += 2;

                    break;

                case "D0":
                    console.log("BNE");

                    // Branch if they were not equal (set to 1 if equal)
                    if (this.Zflag !== 1) {
                        // Read 1 byte
                        instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                        var hexString = instructionData.pop();
                        var hexValue = parseInt(hexString, 16);

                        // Add new value to PC
                        this.PC = (this.PC + hexValue) % _MemoryConstants.PROCESS_SIZE;
                    }

                    // Move to next instruction
                    this.PC++;

                    break;

                case "EE":
                    console.log("INC");

                    for (var i = 0; i < 2; i++) {
                        instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
                    }

                    var memoryAddress = "";

                    for (var i = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    // Get the byte from memory
                    var hexString = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue = parseInt(hexString, 16);

                    // Increment the byte
                    hexValue++;

                    // Store incremented byte back in memory
                    _MemoryManager.writeData(memoryAddress, hexValue, _CurrentPCB.processID);

                    this.PC += 2;

                    break;

                case "FF":
                    console.log("SYS");

                    // Enqueue a new interrupt to do a system call on the next cycle
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_InterruptConstants.SYSTEM_CALL_IRQ, ""));

                    break;

                default:
                    _StdOut.putText("Error! Invalid OP code detected: " + nextInstruction);
                    _StdOut.newLine();
                    _Kernel.krnTrace("Error! Invalid OP code detected. Program termianted");

                    // Remove program by context switching
                    this.removeProgram();

                    break;
            }

            // If round-robin scheduling
            if (_Scheduler.getSchedulingType() === "rr" && _Scheduler.inUse) {
                _Scheduler.incrementQuantum();
            }

            // Clear out instruction data buffer
            instructionData = [];

            // Convert PC back to hex
            var hexPC = this.PC.toString(16);
            this.PC = parseInt(hexPC, 16);

            // Save CPU info back into PCB
            _CurrentPCB.saveInfo();
        };

        // Resets the state of the CPU
        Cpu.prototype.clear = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
        };

        // Loads the CPU state with a new PCB
        Cpu.prototype.loadState = function (pcb) {
            this.PC = pcb.programCounter;
            this.Acc = pcb.accumulator;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        };

        // Displays the CPU information in the browser
        Cpu.prototype.display = function () {
            var cpuInfoTable = document.getElementById("cpuStatus");

            while (cpuInfoTable.rows.length > 1) {
                cpuInfoTable.deleteRow(-1);
            }

            var newRow = cpuInfoTable.insertRow();

            for (var i = 0; i < 5; i++) {
                var key = Object.keys(_CPU)[i];

                var value = _CPU[key];
                var decimalValue = parseInt(value, 10);

                // Don't show Z-flag in hex
                if (i !== 4) {
                    // Convert to hex and add appropriate padding
                    value = TSOS.Utils.decimalToHex(decimalValue);
                }

                var newCell = newRow.insertCell(i);
                newCell.innerHTML = value;
            }
        };

        // Gets a process state to finished, remove from tracking, and log a Context Switch on next clock tick
        Cpu.prototype.removeProgram = function () {
            // Set program to finished
            _CurrentPCB.status = _ProcessStates.FINISHED;

            // Stop tracking program in memory
            _MemoryManager.programsInUse[_CurrentPCB.processID] = 0;

            // Add an interrupt to context switch which will remove process and may stop CPU
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_InterruptConstants.CONTEXT_SWITCH_IRQ, ""));
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
