module TSOS {
	export class MemoryManager {

		// Fields
		public memoryObject: TSOS.Memory;
		public programsInUse: number[];
		public pidsOnDisk: number[];

		// Constructors
		constructor() {

			this.memoryObject = null;
			this.programsInUse = [0, 0, 0];
			this.pidsOnDisk = [];
		}

		// Methods

		// Create new memory object and clear it out
		public initializeMemory(): void {

			this.memoryObject = new Memory();
			this.clearMemory();
		}

		// Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
		public clearMemory(processID: number = -1): void {

			// Clear specific processID of memory
			if(processID >= 0 && processID <= 2) {

				var baseAddress: number = processID * _MemoryConstants.PROCESS_SIZE;
				var limitAddress: number = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

				var startingRow: number = baseAddress / _MemoryConstants.BYTES_PER_ROW;
				var endingRow: number = Math.floor(limitAddress / _MemoryConstants.BYTES_PER_ROW);

				for(var i = startingRow; i <= endingRow; i++) {
					for(var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryObject.memoryList[i][j] = "00";
					}
				}

				// Clear tracking of used memory
				this.programsInUse[processID] = 0;

			}

			// Clear all of memory
			else {

				// Loop through all of memory, making the values "00"
				for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
					for(var j: number = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
						this.memoryObject.memoryList[i][j] = "00";
					}
				}

				// Clear tracking of used memory
				this.programsInUse = [0, 0, 0];

			} // else

		} // clearMemory()

		// Loads the program into physical memory or disks
		// Broken?
		public loadProgram(byteList: string[]) : void {

			var memorySlotFound: boolean = false;

			// Find hole in memory to load program
			for(var i: number = 0; i < this.programsInUse.length; i++) {

				if(this.programsInUse[i] === 0) {

					var memorySlot: number = i;

					// Check if disk does not hold same process name
					var fileNamesOnDisk: string[] = _KrnFileSystemDriver.getFileNames();

					var pidFound: boolean = false;
					var currentPID: number = i;

					// Look for valid PID
					while(!pidFound && fileNamesOnDisk.length !== 0) {

						console.log("Disk has files to look through.");
						
						var correspondingFileName: string = ".process" + currentPID + ".swp";

						// Check each file on disk and see if one has the same PID
						for(var j: number = 0; j < fileNamesOnDisk.length; j++) {

							if(fileNamesOnDisk[j] === correspondingFileName) {

								// Check next PID
								currentPID++;
								break;
							}

							else if((j + 1) === fileNamesOnDisk.length) {

								pidFound = true;
							}
						}

					} // while


					var processNumber: number = currentPID;

					memorySlotFound = true;

					break;
				} // if
			}

			// Load into memory
			if(memorySlotFound) {
				
				// Clear memory
				this.clearMemory(memorySlot);

				// Start at the beginning of the specified program section
				var baseAddress: number = memorySlot * _MemoryConstants.PROCESS_SIZE;
				var limitAddress: number = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

				var startingRow: number = baseAddress / _MemoryConstants.BYTES_PER_ROW;
				var endingRow: number = startingRow + Math.floor(byteList.length / _MemoryConstants.BYTES_PER_ROW);

				var index: number = 0;

				for(; startingRow <= endingRow; startingRow++) {

					for(var colNumber: number = 0; colNumber < _MemoryConstants.NUM_COLUMNS; colNumber++) {

						if(index < byteList.length) {

							this.memoryObject.memoryList[startingRow][colNumber] = byteList[index];
							index++;
						}
					}
				}

				// Reload memory display
				this.displayMemory();

				var newPCB: TSOS.PCB = new PCB(processNumber, baseAddress, limitAddress);
				newPCB.timeArrived = _OSclock; // Used in FCFS scheduling
				newPCB.status = _ProcessStates.NEW; // Used for scheduling

				// Set priority based off of size of program
				newPCB.priority = byteList.length;

				// Set location to memory
				newPCB.location = _Locations.MEMORY;

				newPCB.memorySlot = processNumber;

				_ResidentQueue.push(newPCB);

				// Keep track of where program is loaded
				this.programsInUse[processNumber] = 1;

				_StdOut.putText("Program loaded | PID " + processNumber + " created");

			} // if

			// Load onto disk
			else {

				// Convert byteList into concatenated string
				var memoryContents: string = byteList.join("");

				// Pad string with 00's
				for(var i: number = memoryContents.length / 2; i < _MemoryConstants.PROCESS_SIZE; i++) {
					memoryContents += "00";
				}

				// Find available PID
				var processID: number = 0;
				var currentPID: number = 3;

				var pidFound: boolean = false;

				// Look for next  available PID
				while(!pidFound) {

					// PID not in use
					if(this.pidsOnDisk.indexOf(currentPID) === -1) {

						processID = currentPID;
						pidFound = true;

						// Add this processID to pidsOnDisk
						this.pidsOnDisk.push(processID); 
					}

					else {
						currentPID++;
					}
				}

				console.log("PID to use: " + processID);

				// Create swap file
				var fileName: string = "process" + processID + ".swp";

				_KrnFileSystemDriver.createFile(fileName, true);

				// Denote swap file as hidden
				fileName = "." + fileName;

				// Write memory contents to swap file
				_KrnFileSystemDriver.writeFile(fileName, memoryContents);

				var newPCB: TSOS.PCB = new PCB(processID);
				newPCB.timeArrived = _OSclock; // Used in FCFS scheduling
				newPCB.status = _ProcessStates.NEW; // Used for scheduling

				// Set priority based off of size of program
				newPCB.priority = byteList.length;

				// Set location to disk
				newPCB.location = _Locations.DISK;

				_ResidentQueue.push(newPCB);

				_StdOut.putText("Program loaded | PID " + processID + " created");

				_KrnFileSystemDriver.displayFileSystem();

			} // else

			console.log(_ResidentQueue);

		} // loadProgram()

		// Display the (potentially updated) memory in the browser
		public displayMemory(): void {

			var memoryTable = <HTMLTableElement>document.getElementById("mainMemory");

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

						var cellValue: string = this.memoryObject.memoryList[rowNumber][columnNumber - 1];
						cell.innerHTML = cellValue;
					}

				} // Inner for
			} // Outer for

		} // displayMemory()

		// Returns the value of the byte in memory using PC and PID
		public getByte(programCounter: number, processID: number): string {

			// Valid address
			if(this.validateAddress(programCounter, processID)) {

				var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
				rowNumber += Math.floor(programCounter / _MemoryConstants.BYTES_PER_ROW);

				var columnNumber: number = programCounter % _MemoryConstants.BYTES_PER_ROW;

				return this.memoryObject.memoryList[rowNumber][columnNumber];
			}

			// Invalid address
			else {
				throw new SystemException("Out of bounds memory access");
			}
		}

		// Writes a byte at the given address
		public writeData(address: string, inputValue: number, processID: number): void {

			// Convert memoryAddress to hex
			var hexAddress: number = parseInt(address, 16);

			// Valid address
			if(this.validateAddress(hexAddress, processID)) {

				var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
				rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

				var columnNumber: number = hexAddress % _MemoryConstants.BYTES_PER_ROW;

				// Convert input value to hex
				var valueString: string = inputValue.toString(16);

				// Pad inputValue if necessary
				if(valueString.length === 1) {
					valueString = "0" + valueString;
				}

				var properString: string = Utils.toUpperHex(valueString);

				// Write value to memory
				this.memoryObject.memoryList[rowNumber][columnNumber] = properString;
			}

			// Invalid address
			else {
				throw new SystemException("Out of bounds memory access");
			}

		} // writeData()

		// Returns the byte at the given address
		public getData(address: string, processID: number): string {

			// Convert address to hex
			var hexAddress: number = parseInt(address, 16);

			// Valid address
			if(this.validateAddress(hexAddress, processID)) {

				var rowNumber: number = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
				rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

				var columnNumber: number = hexAddress % _MemoryConstants.BYTES_PER_ROW;

				return this.memoryObject.memoryList[rowNumber][columnNumber];
			}

			// Invalid address
			else {
				throw new SystemException("Out of bounds memory access");
			}

		}

		// Returns the contents of memory as a concatenated string
		public getMemoryContents(processID: number): string {

			var pcbFound: boolean = false;

			// Check if process is in memory
			for(var i: number = 0; i < _ReadyQueue.getSize(); i++) {

				var currentPCB: TSOS.PCB = _ReadyQueue.q[i];

				// PCB found and it was in memory
				if(currentPCB.processID === processID && currentPCB.location === _Locations.MEMORY) {

					pcbFound = true;
				}
			}

			if(pcbFound) {

				var outputString: string = "";

				var startingRow: number = currentPCB.baseRegister / _MemoryConstants.BYTES_PER_ROW;
				var endingRow: number = Math.floor(currentPCB.limitRegister / _MemoryConstants.BYTES_PER_ROW);

				console.log("Starting: " + startingRow);
				console.log("Ending: " + endingRow);

				for(var currentRow: number = startingRow; currentRow <= endingRow; currentRow++) {
					for(var currentColumn: number = 0; currentColumn < _MemoryConstants.NUM_COLUMNS; currentColumn++) {

						// Concatenate memory contents to outputString
						outputString += this.memoryObject.memoryList[currentRow][currentColumn];
					}

				}

				return outputString;
			}

			else {
				return "";
			}

		} // getMemoryContents()

		// Put the contents of memory from a PCB on disk back into memory.
		// Return memorySlot where program was placed
		public putMemoryContents(byteList: string[], memorySlot: number): boolean {

			// Update PCB with slot it is stored in
			console.log("Space at " + memorySlot + " is empty. Fill.");

			var base: number = memorySlot * _MemoryConstants.PROCESS_SIZE;
			var limit: number = base + _MemoryConstants.PROCESS_SIZE - 1;

			var startingRow: number = base / _MemoryConstants.BYTES_PER_ROW;
			var endingRow: number = Math.floor(limit / _MemoryConstants.BYTES_PER_ROW);

			console.log("Starting: " + startingRow);
			console.log("Ending: " + endingRow);

			var index: number = 0;

			// Load memory with the swapped in processes memory
			for(var currentRow: number = startingRow; currentRow <= endingRow; currentRow++) {
				for(var currentColumn: number = 0; currentColumn < _MemoryConstants.NUM_COLUMNS; currentColumn++) {

					this.memoryObject.memoryList[currentRow][currentColumn] = byteList[index];
					index++;
				}
			}

			this.programsInUse[memorySlot] = 1;

			return true;

		} // putMemoryContents

		// Determines if a given address is within a processID's memory limit
		private validateAddress(address: number, processID: number): boolean {

			var pcbBase: number = _CurrentPCB.baseRegister;
			var pcbLimit: number = _CurrentPCB.limitRegister;

			var adjustedAddress: number = pcbBase + address;

			// Valid address
			if(adjustedAddress >= pcbBase && adjustedAddress <= pcbLimit) {
				return true;
			}

			// Invalid address
			else {
				return false;
			}

		} // validateAddress()

	}
}