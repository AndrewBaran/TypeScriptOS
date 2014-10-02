module TSOS {
	export class PCB {

		// TODO Probably need additional fields
		// Fields
		public processID: number;
		public baseRegister: number;
		public limitRegister: number;

		public programCounter: number;
		public accumulator: number;
		public Xreg: number;
		public Yreg: number;
		public Zflag: number;
		public isExecuting: boolean;

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
					isExecuting = false,
					cyclesComplete = 0) {
			this.processID = processID;
			this.baseRegister = baseRegister;
			this.limitRegister = limitRegister;
			this.programCounter = programCounter;
			this.accumulator = accumulator;
			this.Xreg = Xreg;
			this.Yreg = Yreg;
			this.Zflag = Zflag;
			this.isExecuting = isExecuting;
			this.cyclesComplete = cyclesComplete;
		}

		// Methods
		public saveInfo() : void {

			this.programCounter = _CPU.PC;
			this.accumulator = _CPU.Acc;
			this.Xreg = _CPU.Xreg;
			this.Yreg = _CPU.Yreg;
			this.Zflag = _CPU.Zflag;
		}

		public display() : void {
			_StdOut.putText("PC = " + this.programCounter + " | Acc = " + this.accumulator + " | Xreg = " + this.Xreg + " | Yreg = " + this.Yreg + " | Zflag = " + this.Zflag);
		}

	}
}