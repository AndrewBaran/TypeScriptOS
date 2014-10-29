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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {

            _Kernel.krnTrace('CPU cycle');

            // Check if first cycle
            if(_CurrentPCB.cyclesComplete === 0) {

                // Clear CPU
                this.clear();
            }

            // Check if the PC is valid
            if(this.PC >= 0 && this.PC < _MemoryConstants.PROCESS_SIZE) {

                // Get real instruction from memory
                var nextInstruction: string = _MemoryManager.getByte(this.PC, _CurrentPCB.processID);
            }

            // Error
            else {

            	// TODO Probably better to remove program instead
                _Kernel.krnTrapError("Error! PC must be in range: 0 <= PC <= " + _MemoryConstants.PROCESS_SIZE);

            }

            // Convert PC to decimal equivalent
            var decimalPC: string = this.PC.toString(10);
            this.PC = parseInt(decimalPC, 10);

            // Increment PC to point to next byte (could be instruction or data)
            this.PC++;

            // Increment number of cycles done
            _CurrentPCB.cyclesComplete++;

            var instructionData: string[] = [];

            // Switch statement using instruction to get data and execute instruction
            switch(nextInstruction) {

            	// Load the accumulator with a constant
            	case "A9":

            		console.log("LDA");

            		// Read 1 data byte
            		instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

            		var hexString: string = instructionData.pop();
            		var hexValue: number = parseInt(hexString, 16);

            		// Load accumulator with constant
            		this.Acc = hexValue;

            		// Increment PC
            		this.PC++;

            		break;

            	// Load the accumulator from memory
            	case "AD":

            		console.log("LDA");

            		// Read 2 data bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

                    for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var stringValue: string = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue: number = parseInt(stringValue, 16);

                    this.Acc = hexValue;

            		this.PC += 2;

            		break;

            	// Store the accumulator in memory
            	case "8D":

            		console.log("STA");

            		// Read 2 data bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

            		for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
            		}

                    _MemoryManager.writeData(memoryAddress, _CPU.Acc, _CurrentPCB.processID);

            		this.PC += 2;

            		break;

                // Add contents of address to accumlator and keep result in accumulator
            	case "6D":

            		console.log("ADC");

            		// Read 2 data bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

                    for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var stringValue: string = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue: number = parseInt(stringValue, 16);

                    // Add to accumulator
                    this.Acc += hexValue;

            		this.PC += 2;

            		break;

            	// Load the X register with a constant
            	case "A2":

            		console.log("LDX");

            		// Read 1 data byte
            		instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                    var hexString: string = instructionData.pop();
                    var hexValue: number = parseInt(hexString, 16);

                    this.Xreg = hexValue;

            		this.PC++;

            		break;

            	// Load the X register from memory
            	case "AE":

            		console.log("LDX");

            		// Read 2 data bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

                    for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var hexString: string = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue: number = parseInt(hexString, 16);

                    // Load Yreg
                    this.Xreg = hexValue;

                    this.PC += 2;

            		break;

            	// Load the Y register with a constant
            	case "A0":

            		console.log("LDY");

            		// Read 1 data byte
            		instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                    var hexString: string = instructionData.pop();
                    var hexValue: number = parseInt(hexString, 16);

                    this.Yreg = hexValue;

            		this.PC++;

            		break;

            	// Load the Y register from memory
            	case "AC":

            		console.log("LDY");

            		// Read 2 data bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

                    for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var hexString: string = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue: number = parseInt(hexString, 16);

                    // Load Yreg
                    this.Yreg = hexValue;

            		this.PC += 2;

            		break;

            	// No Operation
            	case "EA":

            		console.log("NOP");

            		break;

            	// Break
            	case "00":

            		console.log("BRK");

                    this.removeProgram();

            		break;

            	// Compare a byte in memory to X reg
            	// Sets the Z flag (to 1) if equal
            	case "EC":

            		console.log("CPX");

            		// Read 2 bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

                    for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    var hexString: string = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue: number = parseInt(hexString, 16);

                    // Set Zflag if equal
                    if(hexValue === this.Xreg) {
                        this.Zflag = 1;
                    }

                    else {
                        this.Zflag = 0;
                    }

            		this.PC += 2;

            		break;

            	// Branch X bytes if Z flag = 1
            	case "D0":

            		console.log("BNE");

                    // Branch if they were not equal (set to 1 if equal)
                    if(this.Zflag !== 1) {

                		// Read 1 byte
                		instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

                        var hexString: string = instructionData.pop();
                        var hexValue: number = parseInt(hexString, 16);

                        // Add new value to PC
                        this.PC = (this.PC + hexValue) % _MemoryConstants.PROCESS_SIZE;
                    }

                    // Move to next instruction
                    this.PC++;

                	break;

            	// Increment the value of a byte
            	case "EE":

            		console.log("INC");

            		// Read 2 bytes
            		for(var i: number = 0; i < 2; i++) {
            			instructionData.push(_MemoryManager.getByte(this.PC + i, _CurrentPCB.processID));
            		}

                    var memoryAddress: string = "";

                    for(var i: number = 0; i < 2; i++) {
                        memoryAddress += instructionData.pop();
                    }

                    // Get the byte from memory
                    var hexString: string = _MemoryManager.getData(memoryAddress, _CurrentPCB.processID);
                    var hexValue: number = parseInt(hexString, 16);

                    // Increment the byte
                    hexValue++;

                    // Store incremented byte back in memory
                    _MemoryManager.writeData(memoryAddress, hexValue, _CurrentPCB.processID);

            		this.PC += 2;

            		break;

            	// System call
            	case "FF":

            		console.log("SYS");

            		// Enqueue a new interrupt to do a system call on the next cycle
                    _KernelInterruptQueue.enqueue(new Interrupt(_InterruptConstants.SYSTEM_CALL_IRQ, ""));

            		break;

            	// Invalid OP code
            	default:

                    _StdOut.putText("Error! Invalid OP code detected: " + nextInstruction);
                    _Kernel.krnTrace("Error! Invalid OP code detected. Program termianted");

                    // Remove program by context switching
                    this.removeProgram();

            		break;

            }

            // If round-robin scheduling
            if(_Scheduler.getSchedulingType() === "rr" && _Scheduler.inUse) {

                console.log("RR scheduling");
                _Scheduler.incrementQuantum();
            }
            
            // Clear out instruction data buffer
            instructionData = [];

            // Convert PC back to hex
            var hexPC: string = this.PC.toString(16);
            this.PC = parseInt(hexPC, 16);

            // Save CPU info back into PCB
            _CurrentPCB.saveInfo();

        } // cycle()

        // Resets the state of the CPU
        public clear(): void {

            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
        }

        // Loads the CPU state with a new PCB
        public loadState(pcb: TSOS.PCB): void {

            this.PC = pcb.programCounter;
            this.Acc = pcb.accumulator;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        }

        // Displays the CPU information in the browser
        public display(): void {

            var cpuInfoTable = <HTMLTableElement>document.getElementById("cpuStatus");

            // Check if table has any rows and remove them
            while(cpuInfoTable.rows.length > 1) {
                cpuInfoTable.deleteRow(-1);
            }

            var newRow = <HTMLTableRowElement>cpuInfoTable.insertRow();

            // Display each value in the CPU table
            for(var i: number = 0; i < 5; i++) {

                var key: string = Object.keys(_CPU)[i];

                var value: string = _CPU[key];
                var decimalValue: number = parseInt(value, 10);

                // Don't show Z-flag in hex
                if(i !== 4) {

                    // Convert to hex and add appropriate padding
                    value = Utils.decimalToHex(decimalValue);
                }

                var newCell = newRow.insertCell(i);
                newCell.innerHTML = value;
            }

        } // displayCPU()

        public removeProgram(): void {

            // Set program to finished
            _CurrentPCB.status = _ProcessStates.FINISHED;

            // Stop tracking program in memory
            _MemoryManager.programsInUse[_CurrentPCB.processID] = 0;

            // Add an interrupt to context switch which will remove process and may stop CPU
            _KernelInterruptQueue.enqueue(new Interrupt(_InterruptConstants.CONTEXT_SWITCH_IRQ, ""));
        }

    }
}
