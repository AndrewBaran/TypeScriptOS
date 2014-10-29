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

		// TODO Implement
		public schedule(): void {

			// Select appropriate scheduling depending on type
			switch(this.schedulingType) {

				// Round robin
				case "rr":

					console.log("Round robin scheduling");

					// Take items off resident queue

					break;

				// First-come first-serve
				case "fcfs":

					console.log("First-come first-serve scheduling");
					break;

				// Priority
				case "priority":

					console.log("Priority scheduling");
					break;

				case "default":

					console.log("This shouldn't happen");
					break;

			} // switch
		}

	}
}