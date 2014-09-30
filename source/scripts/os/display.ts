module TSOS {
	export class Display {

		// TODO Probably a smoother way to do this
		public static displayCPU(): void {

			var cpuInfoTable = <HTMLTableElement>document.getElementById("cpuStatus");

			// Check if table has any rows and remove them
			while(cpuInfoTable.rows.length > 2) {
				cpuInfoTable.deleteRow(-1);
			}

			var newRow = <HTMLTableRowElement>cpuInfoTable.insertRow();

			// Display each value in the CPU table
			for(var i: number = 0; i < 5; i++) {
				var key: string = Object.keys(_CPU)[i];
				var value: string = _CPU[key];

				var newCell = newRow.insertCell(i);
				newCell.innerHTML = value;
			}


		} // displayCPU()

		public static displayMemory() : void {
			var memoryTable = <HTMLTableElement>document.getElementById("mainMemory");

			// TODO This seems unnecessary?
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

						var cellValue: string = _Memory.memoryList[rowNumber][columnNumber - 1];
						cell.innerHTML = cellValue;
					}

				} // Inner for
			} // Outer for
		}

	}
}