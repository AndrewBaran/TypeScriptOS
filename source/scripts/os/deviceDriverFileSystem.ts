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

			for(var i: number = 0; i < _FileConstants.BLOCK_SIZE; i++) {

				// Set inuse, and next t,s,b to 0
				if(i >= 0 && i <= 3) {
					defaultValue += "0";
				}

				// Pad with twice the hex symbols, as 1 byte = 2 hex
				else {
					defaultValue += "00";
				}
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

							console.log("Data block at (" + trackNumber + ", " + sectorNumber + ", " + blockNumber + ") is free.");
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

						// Skip master boot record
						if(trackNumber === 0 && sectorNumber === 0 && blockNumber === 0) {
							continue;
						}

						var currentDirectoryBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						if(!currentDirectoryBlock.inUse) {

							console.log("Directory block at (" + trackNumber + ", " + sectorNumber + ", " + blockNumber + ") is free.");
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
				var hexString: string = Utils.stringToHex(fileName);

				// Set directoryBlock.data to the hex fileName
				currentDirectoryBlock.data = hexString;

				// Set currentDirectoryBlock to in use
				currentDirectoryBlock.inUse = true;

				// Set currentDirectoryBlock to point to dataBlock
				currentDirectoryBlock.nextTrack = currentDataBlock.track.toString();
				currentDirectoryBlock.nextSector = currentDataBlock.sector.toString();
				currentDirectoryBlock.nextBlock = currentDataBlock.block.toString();

				// Set dataBlock to in use
				currentDataBlock.inUse = true;

				// Update storage of these two blocks
				this.updateBlock(currentDirectoryBlock);
				this.updateBlock(currentDataBlock);

				return true;
			}

			// No room to add file to system
			else {

				// Let shell.ts handle error message
				return false;
			}

		} // createFile

		// Gets the block at the specified track, sector, and block
		private getBlock(track: number, sector: number, block: number): TSOS.Block {

			var key: string = track.toString() + sector.toString() + block.toString();
			var blockData: string = sessionStorage.getItem(key);

			var newBlock: TSOS.Block = new Block(key, blockData);

			return newBlock;
		}

		// Takes a Block object and updates the session storage version of it
		private updateBlock(inputBlock: TSOS.Block): boolean {

			var blockData: string = "";

			if(inputBlock.inUse) {
				blockData += "1";
			}

			else {
				blockData += "0";
			}

			blockData += inputBlock.nextTrack;
			blockData += inputBlock.nextSector;
			blockData += inputBlock.nextBlock;

			blockData += inputBlock.data;

			// Pad until data block is full
			for(var i: number = inputBlock.data.length / 2; i < _FileConstants.DATA_SIZE; i++) {
				blockData += "00";
			}

			var key: string = inputBlock.track.toString() + inputBlock.sector.toString() + inputBlock.block.toString();
			sessionStorage.setItem(key, blockData);

			return true;
		}
	}
}