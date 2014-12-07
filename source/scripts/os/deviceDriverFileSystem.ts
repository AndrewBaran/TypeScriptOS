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

			// Check if file already on disk
			var fileNamesOnDisk: string[] = this.getFileNames();
			var fileNameFound: boolean = false;

			for(var i: number = 0; i < fileNamesOnDisk.length; i++) {

				if(fileNamesOnDisk[i] === fileName) {

					fileNameFound = true;
					break;
				}
			}

			// Duplicate file found; don't create it
			if(fileNameFound) {

				_Kernel.krnTrace("Error! Duplicate file found.");
				return false;
			}

			// Add file to system
			else if(directoryBlockFound && dataBlockFound) {

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

				// Set dataBlock data to all -'s
				var dataString: string = "";

				for(var i: number = 0; i < _FileConstants.DATA_SIZE; i++) {
					dataString += "-";
				}

				currentDataBlock.data = dataString;

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

		// Write the contents to the specified file
		public writeFile(fileName: string, contentToWrite: string): boolean {

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

			if(directoryBlockFound) {

				var track: number = parseInt(currentDirectoryBlock.nextTrack, 10);
				var sector: number = parseInt(currentDirectoryBlock.nextSector, 10);
				var block: number = parseInt(currentDirectoryBlock.nextBlock, 10);

				var dataBlock: TSOS.Block = this.getBlock(track, sector, block);

				// Erase contents before writing
				this.eraseBlockChain(dataBlock);

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

					// Find a new block to write to and add it to the block chain
					else {

						// Find a new block
						var nextDataBlock: TSOS.Block = this.findNewBlock();

						// Can't find new block to write to
						if(nextDataBlock === null) {
							return false;
						}

						// Set currentDataBlock to point to the nextDataBlock
						dataBlock.nextTrack = nextDataBlock.track.toString();
						dataBlock.nextSector = nextDataBlock.sector.toString();
						dataBlock.nextBlock = nextDataBlock.block.toString();

						// Set nextDataBlock to in use
						nextDataBlock.inUse = true;

						// Set nextDataBlock to point to no other block
						nextDataBlock.nextTrack = "-";
						nextDataBlock.nextSector = "-";
						nextDataBlock.nextBlock = "-";

						// Store these blocks back into storage
						this.updateBlock(dataBlock);
						this.updateBlock(nextDataBlock);

						// Set dataBlock to this nextDataBlock
						dataBlock = nextDataBlock;
					}

				} // while

				return true;
			}

			else {
				_Kernel.krnTrace("Error! File " + fileName + " could not be found to write to.");
			}

		} // writeFile()

		// Deletes a file from the disk
		public deleteFile(fileName: string): boolean {

			// Find corresponding directory block
			var directoryBlockFound: boolean = false;

			for(var trackNumber: number = 0; trackNumber < 1; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

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

			// Get first block of this file
			var track: number = parseInt(currentDirectoryBlock.nextTrack, 10);
			var sector: number = parseInt(currentDirectoryBlock.nextSector, 10);
			var block: number = parseInt(currentDirectoryBlock.nextBlock, 10);

			var dataBlock: TSOS.Block = this.getBlock(track, sector, block); 

			// Delete the block and its associated chain
			this.eraseBlockChain(dataBlock, true);

			// Set the directory block to not in use
			currentDirectoryBlock.inUse = false;

			this.updateBlock(currentDirectoryBlock);

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

		// Searches for an available block in the data section on the disk
		private findNewBlock(): TSOS.Block {

			for(var trackNumber: number = 1; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						var currentDataBlock: TSOS.Block = this.getBlock(trackNumber, sectorNumber, blockNumber);

						// Available block
						if(!currentDataBlock.inUse) {
							return currentDataBlock;
						}
					}
				}
			}

			// No available blocks found
			return null;

		} // findNewBlock()

		// Sets each block in a block chain (including first block when deleting) to not in use
		private eraseBlockChain(startingBlock: TSOS.Block, deletingFile: boolean = false): void {

			var currentBlock: TSOS.Block = null;
			var stillErasing: boolean = false;

			// Edge case for first block
			if(deletingFile) {

				startingBlock.inUse = false;
				this.updateBlock(startingBlock);
			}

			// One block; don't do anything
			if(startingBlock.nextTrack === "-" || startingBlock.nextSector === "-" || startingBlock.nextBlock === "-") {
				return;
			}

			else {

				var track: number = parseInt(startingBlock.nextTrack, 10);
				var sector: number = parseInt(startingBlock.nextSector, 10);
				var block: number = parseInt(startingBlock.nextBlock, 10);

				currentBlock = this.getBlock(track, sector, block);

				stillErasing = true;
			}

			while(stillErasing) {

				currentBlock.inUse = false;

				this.updateBlock(currentBlock);

				if(currentBlock.nextTrack === "-" || currentBlock.nextSector === "-" || currentBlock.nextBlock === "-") {

					stillErasing = false;
				}

				else {

					var track: number = parseInt(currentBlock.nextTrack, 10);
					var sector: number = parseInt(currentBlock.nextSector, 10);
					var block: number = parseInt(currentBlock.nextBlock, 10);

					currentBlock = this.getBlock(track, sector, block);
				}
			}

		} // eraseBlockChain()

	}
}