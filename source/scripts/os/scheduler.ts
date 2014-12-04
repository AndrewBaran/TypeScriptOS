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

				// Round robin
				case "rr":

					_Kernel.krnTrace("Scheduling programs using round robin.");

					// Take items off resident queue and put into ready queue
					var queueLength: number = _ResidentQueue.length;

					for(var i: number = 0; i < queueLength; i++) {

						var currentPCB: TSOS.PCB = _ResidentQueue[i];

						_ReadyQueue.enqueue(currentPCB);
					}

					// Clear the resident queue
					_ResidentQueue = [];

					// Reset quantum (used if someone loads during runall)
					if(!_CPU.isExecuting) {
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

				// First-come first-serve and priority (very similar, just use different sorting algorithms)
				case "fcfs": case "priority":

					if(this.schedulingType === "fcfs") {
						_Kernel.krnTrace("Scheduling programs using first-come first-serve.");
					}

					else {
						_Kernel.krnTrace("Scheduling programs using priority.");
					}

					var listToSort: TSOS.PCB [] = [];

					// Get all items off the resident queue
					for(var i: number = 0; i < _ResidentQueue.length; i++) {

						var currentPCB: TSOS.PCB = _ResidentQueue[i];
						listToSort.push(currentPCB);
					}

					// Clear resident queue
					_ResidentQueue = [];

					// Get all items, except the first item, off the ready queue
					var readyQueueLength: number = _ReadyQueue.getSize();

					for(var i: number = 1; i < readyQueueLength; i++) {

						var currentPCB: TSOS.PCB = _ReadyQueue.q[i];
						listToSort.push(currentPCB);
					}

					// Clear ready queue if it has elements; save first element (one in use by CPU)
					if(_ReadyQueue.getSize() !== 0) {

						var pcbInUse: TSOS.PCB = _ReadyQueue.dequeue();
						
						_ReadyQueue = new Queue();
						_ReadyQueue.enqueue(pcbInUse);
					}

					// FCFS scheduling
					if(this.schedulingType === "fcfs") {

						// Sort the list into increasing arrival time in system
						listToSort.sort(Utils.compareUsingTimeArrived);
					}

					// Priority scheduling
					else {
						
						// Sort the list into decreasing priority
						listToSort.sort(Utils.compareUsingPriority);
					}

					// Push sorted list items back into the ready queue
					var listLength: number = listToSort.length;

					for(var i: number = 0; i < listLength; i++) {

						var currentPCB: TSOS.PCB = listToSort[i];

						// Set status to ready
						currentPCB.status = _ProcessStates.READY;

						// Add PCB to the ready queue
						_ReadyQueue.enqueue(currentPCB);
					}

					// Set scheduler falg
					this.inUse = true;

					// Set global PCB to first item
					_CurrentPCB = _ReadyQueue.peek();
					_CurrentPCB.status = _ProcessStates.RUNNING;

					_Kernel.krnTrace("Process state of PID " + _CurrentPCB.processID + " loaded.");

					break;

				default:

					console.log("This shouldn't happen");
					break;

			} // switch

			// Check if current PCB is on disk
			if(_CurrentPCB.location === _Locations.DISK) {

				console.log("_CurrentPCB is on disk");

				var memorySlotFound: boolean = false;

				// Check for open space in memory
				for(var i: number = 0; i < _MemoryManager.programsInUse.length; i++) {

					if(_MemoryManager.programsInUse[i] === 0) {

						var memorySlot: number = i;
						memorySlotFound = true;

						break;
					}
				}

				// Pick one at random; no available slots in memory
				if(!memorySlotFound) {

					var randomSlot: number = Math.floor(Math.random() * _MemoryManager.programsInUse.length);
					console.log("Replacing slot " + randomSlot);

					memorySlot = randomSlot;

					// Find correspond PCB to this memorySlot
					for(var i: number = 0; i < _ReadyQueue.getSize(); i++) {

						var pcbToReplace: TSOS.PCB = _ReadyQueue.q[i];

						if(pcbToReplace.memorySlot === memorySlot) {

							break;
						}
					}

					_Kernel.programRollOut(pcbToReplace.processID, false);

					pcbToReplace.location = _Locations.DISK;
					pcbToReplace.memorySlot = -1;
					pcbToReplace.baseRegister = 0;
					pcbToReplace.limitRegister = 0;

					// Put back in ready queue
					_ReadyQueue.q[i] = pcbToReplace;
				}

				// Place program into memory
				_Kernel.programRollIn(_CurrentPCB.processID, memorySlot, false)

				_CurrentPCB.location = _Locations.MEMORY;
				_CurrentPCB.memorySlot = memorySlot;
				_CurrentPCB.baseRegister = memorySlot * _MemoryConstants.PROCESS_SIZE;
				_CurrentPCB.limitRegister = _CurrentPCB.baseRegister + _MemoryConstants.PROCESS_SIZE - 1;

				// Put back into ready queue
				_ReadyQueue.q[0] = _CurrentPCB;
			}

		} // schedule()

	}
}