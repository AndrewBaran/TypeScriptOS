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
						var key: string = trackNumber.toString() + sectorNumber.toString() + blockNumber.toString();

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
						var trackCell = newRow.insertCell();
						trackCell.innerHTML = trackNumber.toString();

						// Sector
						var sectorCell = newRow.insertCell();
						sectorCell.innerHTML = sectorNumber.toString();

						// Block
						var blockCell = newRow.insertCell();
						blockCell.innerHTML = blockNumber.toString();


						// Create a block object
						var block: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						// In Use
						var inUseCell = newRow.insertCell();
						if(block.inUse) {
							inUseCell.innerHTML = "1";
						}

						else {
							inUseCell.innerHTML = "0";
						}

						// Next Track, Sector, and Block (for chaining)
						var nextTrackCell = newRow.insertCell();
						nextTrackCell.innerHTML = block.nextTrack;

						var nextSector = newRow.insertCell();
						nextSector.innerHTML = block.nextSector;
						
						var nextBlock = newRow.insertCell();
						nextBlock.innerHTML = block.nextBlock;

						// Data
						var dataCell = newRow.insertCell();
						dataCell.innerHTML = block.data;
					}
				}
			}

		} // displayFileSystem()

		// Creates a file in the file system
		public createFile(fileName: string, hiddenFile?: boolean): boolean {

			// Add invalid character to file name to prevent Alan from deleting the file
			if(hiddenFile) {
				fileName = "." + fileName;
			}

			var dataBlockFound: boolean = false;

			// Loop through data entries for available block (tracks 1, 2, and 3)
			for(var trackNumber: number = 1; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						// Get data from current block
						var currentDataBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						if(!currentDataBlock.inUse) {

							console.log("Block at (" + trackNumber + ", " + sectorNumber + ", " + blockNumber + ") is free.");
							dataBlockFound = true;

							break;
						}

					}

					if(dataBlockFound) {
						break;
					}
				}

				if(dataBlockFound) {
					break;
				}
			}

			var directoryBlockFound: boolean = false;

			// Loop through directory entries for available blocks (only track 0)
			for(var trackNumber: number = 0; trackNumber < 1; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						var currentDirectoryBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						if(!currentDirectoryBlock.inUse) {
							directoryBlockFound = true;

							break;
						}

					}

					if(directoryBlockFound) {
						break;
					}
				}

				if(directoryBlockFound) {
					break;
				}
			}

			// Add file to system
			if(directoryBlockFound && dataBlockFound) {

				// Convert the fileName to hex
				// Set directoryBlock.data to the hex fileName
				// Set directoryBlock to in use
				// Set directoryBlock to point to dataBlock
				// Set dataBlock to in use


				return true;
			}

			// No room to add file to system
			else {

				// Let shell.ts handle error messages
				return false;
			}

		} // createFile

		private getBlock(track: number, sector: number, block: number): TSOS.Block {

			var key: string = track.toString() + sector.toString() + block.toString();
			var blockData: string = sessionStorage.getItem(key);

			var newBlock: TSOS.Block = new Block(key, blockData);

			return newBlock;
		}
	}
}