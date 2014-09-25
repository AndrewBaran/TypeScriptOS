// TODO Should this be in the OS folder?

module TSOS {

	export class Memory {

		// Fields
		public static memoryList: string[][];

		public static initializeMemory() : void {

			TSOS.Memory.memoryList = new Array(_MemoryConstants.NUM_ROWS);
			for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
				TSOS.Memory.memoryList[i] = new Array(_MemoryConstants.NUM_COLUMNS);
			}

			TSOS.Memory.clearMemory();

			// Display memory view in browser
			// TODO move this to Display.ts
			TSOS.Memory.displayMemory();

		}

		// Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
		public static clearMemory(sector: number = -1) {

			// TODO Implement
			// Clear specific sector of memory
			if(sector >= 0) {

			}

			// Clear all of memory
			else {

				// Loop through all of memory, making the values the empty string ""
				for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {

					// Skip over the 1st column in each row (this containg memory address of starting byte
					for(var j: number = 1; j < _MemoryConstants.NUM_COLUMNS; j++) {
						TSOS.Memory.memoryList[i][j] = "00";
					}
				}
			} // End else
		} // End clearMemory()

		// Displays the (potentially updated) view of the memory in the browser
		public static displayMemory() {

			var memoryTable = <HTMLTableElement>document.getElementById("mainMemory");

			// Display memory in window
			for(var rowNumber: number = 0; rowNumber < _MemoryConstants.NUM_ROWS; rowNumber++) {

				var newRow = <HTMLTableRowElement>memoryTable.insertRow(rowNumber);

				for(var columnNumber: number = 0; columnNumber < _MemoryConstants.NUM_COLUMNS; columnNumber++) {

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

						var cellValue: string = TSOS.Memory.memoryList[rowNumber][columnNumber];
						cell.innerHTML = cellValue;
					}

				} // Inner for
			} // Outer for

		} // displayMemory()
	}
}