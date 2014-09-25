module TSOS {

	export class Memory {

		// Fields
		public static memoryList: string[][];

		public static initializeMemory() : void {

			// TODO Not working
			// TSOS.Memory.clearMemory();

			// Get the table id
			var memoryTable = <HTMLTableElement>document.getElementById("mainMemory");
			console.log(memoryTable);

			// Display memory in window
			// TODO Probably can refactor to another method. createDisplay()?
			for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {

				// Create a new row
				var row = <HTMLTableRowElement>memoryTable.insertRow(i);

				for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {

					// Create a new cell for each cell at position j
					var cell = row.insertCell(j);

					// First cell in the row; put the hex memory address
					if(j === 0) {

						// Multiply row number by 8 (each cell is a byte; 8 bytes per row)
						var decimalValue: number = i * 8;
						var hexValue: string = decimalValue.toString(16);

						var stringLength: number = hexValue.length;

						// Pad with leading zeros (up to 2) and add 0x
						for(var m: number = 3; m > stringLength; m--) {
							hexValue = "0" + hexValue;
						}

						hexValue = "0x" + hexValue;

						cell.innerHTML = hexValue;
					}

					// Regular ole cell
					else {

						// Get value from 2d-array of memory and put it here
						// TODO
						cell.innerHTML = "FF";
					}

				}
			}
		}

		// Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
		public static clearMemory(sector: number = -1) {

			console.log("In clearMemory()");

			// TODO Implement
			// Clear specific sector of memory
			if(sector >= 0) {

			}

			// Clear all of memory
			else {

				// Loop through all of memory, making the values the empty string ""
				for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
					for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						TSOS.Memory.memoryList[i][j] = "";
					}
				}
			} // End else
		} // End clearMemory()

		// TODO I feel like I need this
		public static displayMemory() {

			console.log("In displayMemory()");

		} // End displayMemory()
	}
}