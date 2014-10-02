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

	}
}