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
		public isExecuting: boolean;



		// Constructor
		constructor(processID = -1,
					baseRegister = 0, 
					limitRegister = 0, 
					programCounter = 0, 
					accumulator = 0, 
					Xreg = 0, 
					Yreg = 0, 
					Zflag = 0, 
					isExecuting = false) {
			this.processID = processID;
			this.baseRegister = baseRegister;
			this.limitRegister = limitRegister;
			this.programCounter = programCounter;
			this.accumulator = accumulator;
			this.Xreg = Xreg;
			this.Yreg = Yreg;
			this.Zflag = Zflag;
			this.isExecuting = isExecuting;
		}

	}
}