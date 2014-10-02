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
            }

            // Check if the PC is valid
            if(this.PC >= 0 && this.PC < _MemoryConstants.PROCESS_SIZE) {

                // Get real instruction from memory
                var nextInstruction: string = _MemoryManager.getByte(this.PC, _CurrentPCB.processID);

                console.log("Instruction: " + nextInstruction);
            }

            // Error
            else {

            	// Destroy program; BSOD; kernel panic

            }

            // Switch statement using instruction to get data and execute instruction
            switch(nextInstruction) {

            	// Load the accumulator with a constant
            	case "A9":

            		console.log("LDA");

            		// Read 1 data byte
            		break;

            	// Load the accumulator from memory
            	case "AD":

            		console.log("LDA");

            		// Read 2 data bytes
            		break;

            	// Store the accumulator in memory
            	case "8D":

            		console.log("SDA");

            		// Read 2 data bytes
            		break;

            	// Add with carry
            	case "6D":

            		console.log("ADC");

            		// Read 2 data bytes
            		break;

            	// Load the X register with a constant
            	case "A2":

            		console.log("LDX");

            		// Read 1 data byte
            		break;

            	// Load the X register from memory
            	case "AE":

            		console.log("LDX");

            		// Read 2 data bytes
            		break;

            	// Load the Y register with a constant
            	case "A0":

            		console.log("LDY");

            		// Read 1 data byte
            		break;

            	// Load the Y register from memory
            	case "AC":

            		console.log("LDY");

            		// Read 2 data bytes
            		break;

            	// No Operation
            	case "EA":

            		console.log("NOP");

            		break;

            	// Break
            	case "00":

            		console.log("BRK");
            		console.log("Program finished.");

            		// Program is complete; stop CPU
            		this.isExecuting = false;

            		// Display PCB in console
            		_CurrentPCB.display();

            		break;

            	// Compare a byte in memory to X reg
            	// Sets the Z flag if equal
            	case "EC":

            		console.log("CPX");

            		// Read 2 bytes?
            		break;

            	// Branch X bytes if Z flag = 0
            	case "D0":

            		console.log("BNE");

            		// Read 1 byte
            		break;

            	// Increment the value of a byte
            	case "EE":

            		console.log("INC");

            		// Read 2 bytes
            		break;

            	// System call
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

        }
    }
}
