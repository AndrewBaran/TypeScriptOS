module TSOS {
	export class Display {

		// TODO Probably a smoother way to do this
		public static displayCPU(): void {

			var cpuInfoTable = <HTMLTableElement>document.getElementById("cpuStatus");

			// Check if table has any rows and remove them
			while(cpuInfoTable.rows.length > 0) {
				cpuInfoTable.deleteRow(-1);
			}

			// Display CPU table (with potentially updated values)
			for(var i: number = 0; i < 2; i++) {

				var newRow = <HTMLTableRowElement>cpuInfoTable.insertRow(i);

				for(var j: number = 0; j < 5; j++) {

					var newCell = newRow.insertCell(j);
					var value: string = "";

					// Display header
					if(i === 0) {

						value = Object.keys(_CPU)[j];
					}

					// Display data
					else {

						var key: string = Object.keys(_CPU)[j];
						value = _CPU[key];
					}

					newCell.innerHTML = value;

				} // Inner for
			} // Outer for

		} // displayCPU()

	}
}