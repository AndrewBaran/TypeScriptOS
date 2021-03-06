module TSOS {
	export class PCB {

		// Fields
		public processID: number;
		public baseRegister: number;
		public limitRegister: number;

		public programCounter: number;
		public accumulator: number;
		public Xreg: number;
		public Yreg: number;
		public Zflag: number;

		public status: string;
		public location: string;
		public priority: number;
		
		public memorySlot: number;
		public isExecuting: boolean;

		public timeArrived: number;
		public cyclesComplete: number;


		// Constructor
		constructor(processID = -1,
					baseRegister = 0, 
					limitRegister = 0, 
					programCounter = 0, 
					accumulator = 0, 
					Xreg = 0, 
					Yreg = 0, 
					Zflag = 0,
					status = "",
					location = "",
					priority = -1,
					memorySlot = -1,
					isExecuting = false,
					timeArrived = 0,
					cyclesComplete = 0) {
			this.processID = processID;
			this.baseRegister = baseRegister;
			this.limitRegister = limitRegister;
			this.programCounter = programCounter;
			this.accumulator = accumulator;
			this.Xreg = Xreg;
			this.Yreg = Yreg;
			this.Zflag = Zflag;
			this.status = status;
			this.location = location;
			this.priority = priority;
			this.isExecuting = isExecuting;
			this.timeArrived = timeArrived;
			this.cyclesComplete = cyclesComplete;
		}

		// Methods
		public saveInfo() : void {

			this.programCounter = _CPU.PC;
			this.accumulator = _CPU.Acc;
			this.Xreg = _CPU.Xreg;
			this.Yreg = _CPU.Yreg;
			this.Zflag = _CPU.Zflag;
			this.isExecuting = _CPU.isExecuting;
		}

		public display() : void {

			var hexPC: string = Utils.decimalToHex(this.programCounter);
			var hexAcc: string = Utils.decimalToHex(this.accumulator);
			var hexXReg: string = Utils.decimalToHex(this.Xreg);
			var hexYReg: string = Utils.decimalToHex(this.Yreg);

			_StdOut.putText("PC = " + hexPC + " | Acc = " + hexAcc + " | Xreg = " + hexXReg + 
				" | Yreg = " + hexYReg + " | Zflag = " + this.Zflag + " | Cycles completed = " + this.cyclesComplete);
			_StdOut.newLine();
		}

	}
}