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

                // Setup stuff
                console.log("Setting up CPU for first cycle");
                
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

            		console.log("SDA");

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

            	// Add with carry
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

            		// Program is complete; stop CPU
            		this.isExecuting = false;

                    // Save the contents of CPU into PCB
                    _CurrentPCB.saveInfo();

            		// Display PCB in console
            		_CurrentPCB.display();

                    // TODO THIS MAY BE BUGGY IN THE FUTURE. FUTURE ME, LOOK HERE
            		// Remove currentPCB from ready queue
                    _ReadyQueue.dequeue();

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

            		this.PC += 2;

            		break;

            	// TODO Branch X bytes if Z flag = 1
                // This is done by wrapping around when you overflow over the limit address
            	case "D0":

            		console.log("BNE");

            		// Read 1 byte
            		instructionData.push(_MemoryManager.getByte(this.PC, _CurrentPCB.processID));

            		this.PC++;

            		break;

            	// TODO Increment the value of a byte
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
                    var hexValue: number = parseInt(hexString);

                    // Increment the byte
                    hexValue++;

                    // TODO Store the byte in memory


            		this.PC += 2;

            		break;

            	// System call
            	// 01 in X reg = print integer stored in Y register
            	// 02 in X reg = print the 00-terminated string stored at the address in the Y register
                // TODO Enqueue an interrupt?
            	case "FF":

            		if((this.Xreg.toString(10)) === "1") {

            			_StdOut.putText(this.Yreg.toString(10));
                        _StdOut.newLine();
            		}

            		else if((this.Xreg.toString(10)) === "2") {

            			// TODO
            			// Print 00-terminated string in Y reg
            		}

            		break;

            	default:

            		console.log("This shouldn't happen.");
            		// TODO Make the CPU implode (or make the kernel panic)

            		break;

            }
            
            // TODO: Accumulate CPU usage and profiling statistics here.

            // Clear out instruction data buffer
            instructionData = [];

            // Convert PC back to hex
            var hexPC: string = this.PC.toString(16);
            this.PC = parseInt(hexPC, 16);

            // Update CPU display
            _CPU.display();

            // Update memory display
            _MemoryManager.displayMemory();

        } // cycle()

        public clear(): void {

            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
        }

        // Displays the CPU information in the browser
        public display(): void {

            var cpuInfoTable = <HTMLTableElement>document.getElementById("cpuStatus");

            // Check if table has any rows and remove them
            while(cpuInfoTable.rows.length > 2) {
                cpuInfoTable.deleteRow(-1);
            }

            var newRow = <HTMLTableRowElement>cpuInfoTable.insertRow();

            // Display each value in the CPU table
            for(var i: number = 0; i < 5; i++) {
                var key: string = Object.keys(_CPU)[i];
                var value: string = _CPU[key];

                var newCell = newRow.insertCell(i);

                newCell.innerHTML = value;
            }

        } // displayCPU()

    }
}
