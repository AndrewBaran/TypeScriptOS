module TSOS {
	export class MemoryManager {

		// Fields
		public memoryObject: TSOS.Memory;
		public programsInUse: number[];

		// Constructors
		constructor() {

			this.memoryObject = null;
			this.programsInUse = [0, 0, 0];
		}

		// Methods

		// Create new memory object and clear it out
		public initializeMemory(): void {

			this.memoryObject = new Memory();
			this.clearMemory();
		}

		// Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
		public clearMemory(processID: number = -1): void {

			// Clear specific processID of memory
			if(processID >= 0 && processID < 3) {

				var baseAddress: number = processID * _MemoryConstants.PROCESS_SIZE;
				var limitAddress: number = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

				var startingRow: number = baseAddress / _MemoryConstants.BYTES_PER_ROW;
				var endingRow: number = Math.floor(limitAddress / 8);

				for(var i = startingRow; i <= endingRow; i++) {
					for(var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryObject.memoryList[i][j] = "00";
					}
				}

				// Clear tracking of used memory
				this.programsInUse[processID] = 0;

			}

			// Clear all of memory
			else {

				// Loop through all of memory, making the values "00"
				for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
					for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryObject.memoryList[i][j] = "00";
					}
				}

				// Clear tracking of used memory
				this.programsInUse = [0, 0, 0];

			} // else

		} // clearMemory()

		// Loads the program into physical memory
		public loadProgram(byteList: string[]) : void {

			// Find hole in memory to load program
			for(var i: number = 0; i < this.programsInUse.length; i++) {

				if(this.programsInUse[i] === 0) {

					var processNumber: number = i;
					break;
				}
			}

			// Clear memory
			this.clearMemory(processNumber);

			// Start at the beginning of the specified program section
			var baseAddress: number = processNumber * _MemoryConstants.PROCESS_SIZE;
			var limitAddress: number = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

			var startingRow: number = baseAddress / _MemoryConstants.BYTES_PER_ROW;
			var endingRow: number = startingRow + Math.floor(byteList.length / _MemoryConstants.BYTES_PER_ROW);

			var index: number = 0;

			for(; startingRow <= endingRow; startingRow++) {

				for(var colNumber: number = 0; colNumber < _MemoryConstants.NUM_COLUMNS; colNumber++) {

					if(index < byteList.length) {

						this.memoryObject.memoryList[startingRow][colNumber] = byteList[index];
						index++;
					}
				}
			}

			// Reload memory display
			this.displayMemory();

			var newPCB: TSOS.PCB = new PCB(processNumber, baseAddress, limitAddress);
			newPCB.timeArrived = _OSclock; // Used in scheduling

			_ResidentQueue.push(newPCB);

			// Keep track of where program is loaded
			this.programsInUse[processNumber] = 1;

			_StdOut.putText("Program loaded | PID " + processNumber + " created");
		}

		// Display the (potentially updated) memory in the browser
		public displayMemory(): void {

			var memoryTable = <HTMLTableElement>document.getElementById("mainMemory");

			// Delete rows in the table if necessary
			while(memoryTable.rows.length > 0) {
				memoryTable.deleteRow(-1);
			}

			// Display memory in window
			for(var rowNumber: number = 0; rowNumber < _MemoryConstants.NUM_ROWS; rowNumber++) {

				var newRow = <HTMLTableRowElement>memoryTable.insertRow(rowNumber);

				for(var columnNumber: number = 0; columnNumber < _MemoryConstants.NUM_COLUMNS + 1; columnNumber++) {

					var cell = newRow.insertCell(columnNumber);

					// First cell in the row; put the hex memory address
					if(columnNumber === 0) {

						// Multiply row number by 8 (each cell is a byte; 8 bytes per row)
						var decimalValue: number = rowNumber * 8;
						var hexValue: string = decimalValue.toString(16);

						var stringLength: number = hexValue.length;

						// Pad with leading zeros (up to 2) and add 0x
						for(var m: number = 3; m > stringLength; m--) {
							hexValue = "0" + hexValue;
						}

						hexValue = "0x" + hexValue;

						cell.innerHTML = hexValue;
					}

					// Regular cell
					else {

						var cellValue: string = this.memoryObject.memoryList[rowNumber][columnNumber - 1];
						cell.innerHTML = cellValue;
					}

				} // Inner for
			} // Outer for

		} // displayMemory()

		// Returns the value of the byte in memory using PC and PID
		public getByte(programCounter: number, processID: number): string {

			// Valid address
			if(this.validateAddress(programCounter, processID)) {

				var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
				rowNumber += Math.floor(programCounter / _MemoryConstants.BYTES_PER_ROW);

				var columnNumber: number = programCounter % _MemoryConstants.BYTES_PER_ROW;

				return this.memoryObject.memoryList[rowNumber][columnNumber];
			}

			// Invalid address
			else {

				// Kill program
				// Stop CPU from executing
				// Stop CPU from executing current instruction
				// Remove program from ready queue
				// Remove track of program in memory

			}
		}

		// TODO BSOD or something if invalid memory access
		public writeData(address: string, inputValue: number, processID: number): void {

			// Valid address
			if(this.validateAddress(address, processID)) {

				// Convert memoryAddress to hex
				var hexAddress: number = parseInt(address, 16);

				var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
				rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

				var columnNumber: number = hexAddress % _MemoryConstants.BYTES_PER_ROW;

				// Convert input value to hex
				var valueString: string = inputValue.toString(16);

				// Pad inputValue if necessary
				if(valueString.length === 1) {
					valueString = "0" + valueString;
				}

				var properString: string = Utils.toUpperHex(valueString);

				// Write value to memory
				this.memoryObject.memoryList[rowNumber][columnNumber] = properString;
			}

			// Invalid address
			else {


			}

		} // writeData()

		// TODO BSOD or something if invalid memory access
		public getData(address: string, processID: number): string {

			// Valid address
			if(this.validateAddress(address, processID)) {

				var hexAddress: number = parseInt(address, 16);

				var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
				rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

				var columnNumber: number = hexAddress % _MemoryConstants.BYTES_PER_ROW;

				return this.memoryObject.memoryList[rowNumber][columnNumber];
			}

			// Invalid address
			else {

			}

		}

		// Determines if a given address is within a processID's memory limit
		private validateAddress(address: string, processID: number): boolean {

			var pcbBase: number = _CurrentPCB.baseRegister;
			var pcbLimit: number = _CurrentPCB.limitRegister;

			// Parse address as decimal
			var addressValue: number = parseInt(address, 16);
			var adjustedAddress: number = (_MemoryConstants.PROCESS_SIZE * processID) + addressValue;

			console.log("addressValue = " + addressValue);
			console.log("adjustedAddress = " adjustedAddress);
			console.log("Base = " + pcbBase);
			console.log("Limit = " + pcbLimit);

			// Valid address
			if(adjustedAddress >= pcbBase && adjustedAddress <= pcbLimit) {

				console.log(addressValue + " is valid.");

				return true;
			}

			// Invalid address
			else {

				console.log(addressValue + " is valid.");

				return false;
			}

		} // validateAddress()

	}
}