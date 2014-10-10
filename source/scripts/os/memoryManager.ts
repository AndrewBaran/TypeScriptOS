module TSOS {
	export class MemoryManager {

		public memoryObject: TSOS.Memory;

		// Constructors
		constructor() {
			this.memoryObject = null;
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

				console.log("Clearing rows " + startingRow + " - " + endingRow);

				for(var i = startingRow; i <= endingRow; i++) {
					for(var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryObject.memoryList[i][j] = "00";
					}
				}

			}

			// Clear all of memory
			else {

				// Loop through all of memory, making the values the empty string ""
				for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
					for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryObject.memoryList[i][j] = "00";
					}
				}
			} // else

		} // clearMemory()

		// Load the program into physical memory; default process block = 0
		public loadProgram(byteList: string[], processNumber: number = 0) : void {

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
			_ResidentQueue.push(newPCB);

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

		// Colors the cell in memory that is the current instruction and data
		public colorCell(programCounter: number, processID: number, memoryType: number = 0): void {

			var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
			rowNumber += Math.floor(programCounter / _MemoryConstants.BYTES_PER_ROW);

			// Add 1 to compensate for first column of every table being the memory address
			var columnNumber: number = (programCounter % _MemoryConstants.BYTES_PER_ROW) + 1;

			var memoryTable = <HTMLTableElement>document.getElementById("mainMemory");
			var row = <HTMLTableRowElement>memoryTable.rows[rowNumber];
			var cell = <HTMLTableCellElement>row.cells[columnNumber];

			switch(memoryType) {

				case _MemoryType.INSTRUCTION:

					console.log("Instruction");

					cell.style.color = "red";

					break;

				case _MemoryType.DATA:

					console.log("Data");

					cell.style.color = "blue";

					break;

				default:

					console.log("Not a valid memory type; not coloring.");
					break;

			} // switch

		}

		// Returns the value of the byte in memory using PC and PID
		public getByte(programCounter: number, processID: number): string {

			var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
			rowNumber += Math.floor(programCounter / _MemoryConstants.BYTES_PER_ROW);

			var columnNumber: number = programCounter % _MemoryConstants.BYTES_PER_ROW;

			return this.memoryObject.memoryList[rowNumber][columnNumber];
		}

		// TODO BSOD or something if invalid memory access
		public writeData(address: string, inputValue: number, processID: number): void {

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

		} // writeData()

		// TODO BSOD or something if invalid memory access
		// TODO This seems unnecessary
		public getData(address: string, processID: number): string {

			var hexAddress: number = parseInt(address, 16);

			var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
			rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

			var columnNumber: number = hexAddress % _MemoryConstants.BYTES_PER_ROW;

			return this.memoryObject.memoryList[rowNumber][columnNumber];
		}

	}
}