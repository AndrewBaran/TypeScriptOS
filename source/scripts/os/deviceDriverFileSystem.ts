///<reference path="deviceDriver.ts" />

module TSOS {
	export class DeviceDriverFileSystem extends DeviceDriver {

		constructor() {
			super(this.krnFSDDEntry, null);
		}

		public krnFSDDEntry(): void {

			this.status = "loaded";
		}

		public initializeStorage(): void {

			var defaultValue: string = "";

			for(var i = 0; i < _FileConstants.BLOCK_SIZE; i++) {
				defaultValue += "-";
			}

			for(var trackNumber: number = 0; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						// Create key as tsb
						var key: string = "";
						key += trackNumber.toString();
						key += sectorNumber.toString();
						key += blockNumber.toString();

						sessionStorage.setItem(key, defaultValue);
					}
				}
			}

		} // initializeStorage()

		public displayFileSystem(): void {

			var table = <HTMLTableElement>document.getElementById("tableFileSystem");

			// Remove all rows except first row
			while(table.rows.length > 1) {
				table.deleteRow(-1);
			}

			// Display table
			for(var trackNumber: number = 0; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						// Create new row
						var newRow = <HTMLTableRowElement>table.insertRow();

						// Track
						var track = newRow.insertCell();
						track.innerHTML = trackNumber.toString();

						// Sector
						var sector = newRow.insertCell();
						sector.innerHTML = sectorNumber.toString();

						// Block
						var block = newRow.insertCell();
						block.innerHTML = blockNumber.toString();

						// Data
						var dataKey: string = trackNumber.toString() + sectorNumber.toString() + blockNumber.toString();
						var dataValue: number = sessionStorage.getItem(dataKey);

						var data = newRow.insertCell();
						data.innerHTML = dataValue.toString();
					}
				}
			}

		} // displayFileSystem()
	}
}