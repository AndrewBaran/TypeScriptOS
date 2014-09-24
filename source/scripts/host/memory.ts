module TSOS {

	export class Memory {

		// Fields
		static memoryList: string[][];

		constructor() {
			// TODO Fill in
		}

		public static initializeMemory() : void {

			console.log("In initializeMemory()");
			
			// Get the table id
			var memoryTable = <HTMLTableElement>(document.getElementById("mainMemory"));
			console.log(memoryTable);

			TSOS.Memory.clearMemory();

			// Display memory

			var testRow = <HTMLTableRowElement>(memoryTable.insertRow(0));
			var cell1 = testRow.insertCell(0);
			cell1.innerHTML = "0x000";

			var cell2 = testRow.insertCell(1);
			cell2.innerHTML = "FF";
			TSOS.Memory.clearMemory();

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
				for(var i: number = 0; i < _MemoryConstants.NUM_COLUMNS; i++) {
					for(var j: number = 0; j < _MemoryConstants.NUM_ROWS; j++) {
						TSOS.Memory.memoryList[i][j] = "";
					}
				}
			} // End else
		} // End clearMemory()
	}
}