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

			var startingRow: number = baseAddress % _MemoryConstants.BYTES_PER_ROW;
			var endingRow: number = startingRow + Math.floor(byteList.length / _MemoryConstants.BYTES_PER_ROW);

			for(; startingRow <= endingRow; startingRow++) {
				for(var colNumber: number = 0; colNumber < _MemoryConstants.NUM_COLUMNS; colNumber++) {

					var index: number = (startingRow * _MemoryConstants.BYTES_PER_ROW) + colNumber;

					if(index < byteList.length) {
						_Memory.memoryList[startingRow][colNumber] = byteList[index];
					}
				}
			}

			// Reload memory display
			TSOS.Display.displayMemory();

			// TODO Create a PCB and print the process ID
			var newPCB: TSOS.PCB = new PCB(processNumber,
											baseAddress,
											limitAddress,
											_CPU.PC,
											_CPU.Acc,
											_CPU.Xreg,
											_CPU.Yreg,
											_CPU.Zflag,
											_CPU.isExecuting);
			_PCBList.push(newPCB);

			_StdOut.putText("Program loaded | PID " + processNumber + " created");
		}
	}
}