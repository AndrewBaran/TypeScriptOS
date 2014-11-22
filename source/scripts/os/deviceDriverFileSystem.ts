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
					defaultValue += "--";
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

						// Replace all the occurences of - with 0 to display
						block.data = block.data.replace(/-/g, "0");
						
						// Data
						var dataCell = newRow.insertCell();
						dataCell.innerHTML = block.data;
					}
				}
			}

		} // displayFileSystem()

		// Returns an array of strings holding each file name
		public getFileNames(): string[] {

			var outputFileNames: string [] = [];

			for(var trackNumber: number = 0; trackNumber < 1; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						// Skip master boot record
						if(trackNumber === 0 && sectorNumber === 0 && blockNumber === 0) {
							continue;
						}

						// Check if block is in use
						var currentDirectoryBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						if(currentDirectoryBlock.inUse) {

							// Get fileName
							var hexFileName: string = "";

							var index: number = 0;
							var currentChar: string = "";

							while((currentChar = currentDirectoryBlock.data.charAt(index)) != "-") {

								hexFileName += currentChar;
								index++;
							}

							var fileName: string = Utils.hexToString(hexFileName);

							outputFileNames.push(fileName);
						}
					}
				}
			}

			return outputFileNames;
		}

		// TODO Make it so dupliciate file name writes over previous file name
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

				// Set dataBlock next t,s,b to -
				currentDataBlock.nextTrack = "-";
				currentDataBlock.nextSector = "-";
				currentDataBlock.nextBlock = "-";

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

		} // createFile()

		// Reads the inputFile and returns its contents to the caller
		public readFile(fileName: string): string {

			var directoryBlockFound: boolean = false;

			// Find key for the directory entry of the block
			for(var trackNumber: number = 0; trackNumber < 1; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						// Skip master boot record
						if(trackNumber === 0 && sectorNumber === 0 && blockNumber === 0) {
							continue;
						}

						var currentDirectoryBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						var dataString: string = Utils.hexToString(currentDirectoryBlock.data);

						if(dataString === fileName) {

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

			var outputString: string = "";
			var stillReading: boolean = true;

			var key: string = currentDirectoryBlock.nextTrack + currentDirectoryBlock.nextSector + currentDirectoryBlock.nextBlock;

			// Read the file
			while(stillReading) {

				// Get data block
				var track: number = parseInt(key.charAt(0), 10);
				var sector: number = parseInt(key.charAt(1), 10);
				var block: number = parseInt(key.charAt(2), 10);

				var dataBlock: TSOS.Block = this.getBlock(track, sector, block);

				var dataString: string = Utils.hexToString(dataBlock.data);

				outputString += dataString;

				// Check if at end of block chain
				if(dataBlock.nextTrack === "-" || dataBlock.nextSector === "-" || dataBlock.nextBlock === "-") {
					stillReading = false;
				}

				// More blocks in block-chain
				else {
					key = dataBlock.nextTrack + dataBlock.nextSector + dataBlock.nextBlock;
				}
			}

			return outputString;

		} // readFile()

		public writeFile(fileName: string, contentToWrite: string): void {

			var directoryBlockFound: boolean = false;

			for(var trackNumber: number = 0; trackNumber < 1; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						var currentDirectoryBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						var dataString: string = Utils.hexToString(currentDirectoryBlock.data);

						if(currentDirectoryBlock.inUse && (dataString === fileName)) {

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

			var track: number = parseInt(currentDirectoryBlock.nextTrack, 10);
			var sector: number = parseInt(currentDirectoryBlock.nextSector, 10);
			var block: number = parseInt(currentDirectoryBlock.nextBlock, 10);

			var dataBlock: TSOS.Block = this.getBlock(track, sector, block);

			var stillWriting: boolean = true;

			// Write the content to the file
			while(contentToWrite.length > 0 && stillWriting) {

				var currentContent: string = contentToWrite.substring(0, _FileConstants.DATA_SIZE);
				contentToWrite = contentToWrite.substring(_FileConstants.DATA_SIZE);

				// Convert currentContent to hex
				var hexString: string = Utils.stringToHex(currentContent);

				dataBlock.data = hexString;

				// Write data back to session storage
				this.updateBlock(dataBlock);

				// No more content to write
				if(contentToWrite.length === 0) {
					stillWriting = false;
				}

				// TODO Implement
				// Find a new block to write to
				else {

				}

			}

		} // writeFile()

		public deleteFile(fileName: string): boolean {

			

			return true;
		}

		// Resets the disk to default state
		public formatDisk(): void {

			this.initializeStorage();
		}

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
				blockData += "--";
			}

			var key: string = inputBlock.track.toString() + inputBlock.sector.toString() + inputBlock.block.toString();
			sessionStorage.setItem(key, blockData);

			return true;

		} // updateBlock()

	}
}