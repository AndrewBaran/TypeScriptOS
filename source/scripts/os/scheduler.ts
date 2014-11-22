module TSOS {
	export class Scheduler {

		private schedulingType: string;
		private quantum: number;
		private quantumUsed: number;

		public inUse: boolean;

		// Default scheduling type is round robin
		constructor() {

			this.schedulingType = "rr";
			this.quantum = 6;
			this.quantumUsed = 0;

			this.inUse = false;
		}

		public setQuantumValue(newQuantum: number): void {
			this.quantum = newQuantum;
		}

		public incrementQuantum(): void {

			this.quantumUsed++;

			// Check if quantum has reached its limit
			if(this.quantumUsed === this.quantum) {

				// Log an interrupt to context switch
				_KernelInterruptQueue.enqueue(new Interrupt(_InterruptConstants.CONTEXT_SWITCH_IRQ, ""));
			}
		}

		public resetQuantum(): void {
			this.quantumUsed = 0;
		}

		public getSchedulingType(): string {
			return this.schedulingType;
		}

		public setSchedulingType(schedulingType: string): void {
			this.schedulingType = schedulingType;
		}

		// Takes PCBs in the resident queue and arranges them in the ready queue accordingly
		public schedule(): void {

			// Select appropriate scheduling depending on type
			switch(this.schedulingType) {

				// Round robin and fcfs (very similar; only minor changes necessary for rr)
				case "rr": case "fcfs":

					if(this.schedulingType === "rr") {
						_Kernel.krnTrace("Scheduling programs using round robin.");
					}

					else {
						_Kernel.krnTrace("Scheduling programs using first-come first-serve.");
					}

					// Take items off resident queue and put into ready queue
					var queueLength: number = _ResidentQueue.length;

					for(var i: number = 0; i < queueLength; i++) {

						var currentPCB: TSOS.PCB = _ResidentQueue[i];

						_ReadyQueue.enqueue(currentPCB);
					}

					// Clear the resident queue
					_ResidentQueue = [];

					// Reset quantum (used if someone loads during runall)
					if(!_CPU.isExecuting && this.schedulingType === "rr") {
						this.resetQuantum();
					}

					// Set each process in ready queue to ready state
					for(var j: number = 0; j < _ReadyQueue.getSize(); j++) {
						_ReadyQueue.q[j].status = _ProcessStates.READY;
					}

					// Set currentPCB to running
					_CurrentPCB = _ReadyQueue.peek();
					_CurrentPCB.status = _ProcessStates.RUNNING;

					// Set scheduler flag
					this.inUse = true;

					// Log the scheduling event
                	_Kernel.krnTrace("Process state of PID " + _CurrentPCB.processID + " loaded.");

					break;

				// Priority
				case "priority":

					console.log("Priority scheduling");
					break;

				default:

					console.log("This shouldn't happen");
					break;

			} // switch
		}

	}
}