// TODO Should this be in the OS folder?

module TSOS {

	export class Memory {

		// Fields
		public memoryList: string[][];

		// Constructors
		constructor() {

			this.memoryList = new Array(_MemoryConstants.NUM_ROWS);
			for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
				this.memoryList[i] = new Array(_MemoryConstants.NUM_COLUMNS);
			}

			this.clearMemory();
		}

		// Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
		public clearMemory(processNumber: number = -1) {

			// TODO Implement
			// Clear specific processNumber of memory
			if(processNumber >= 0) {

			}

			// Clear all of memory
			else {

				// Loop through all of memory, making the values the empty string ""
				for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {

					// Skip over the 1st column in each row (this containg memory address of starting byte
					for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryList[i][j] = "00";
					}
				}
			} // End else
		} // End clearMemory()

		public loadProgram(byteList: string[], processNumber: number = 0) {

			// Start at the beginning of the specified program section
			var baseAddress: number = processNumber * _MemoryConstants.PROCESS_SIZE;
			var limitAddress: number = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

			console.log("Base = " + baseAddress);
			console.log("Limit = " + limitAddress);


			for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
				for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {

				}
			} 
		}

	}
}