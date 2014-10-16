module TSOS {
	export class Scheduler {

		public schedulingType: string;
		public quantum: number;

		// Default scheduling type is round robin
		constructor() {

			this.schedulingType = "rr";
			this.quantum = 6;
		}

		public setQuantum(newQuantum: number): void {
			
			this.quantum = newQuantum;
		}

	}
}