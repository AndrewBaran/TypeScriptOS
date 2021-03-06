var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        // Constructors
        function MemoryManager() {
            this.memoryObject = null;
            this.programsInUse = [0, 0, 0];
            this.pidsOnDisk = [];
        }
        // Methods
        // Create new memory object and clear it out
        MemoryManager.prototype.initializeMemory = function () {
            this.memoryObject = new TSOS.Memory();
            this.clearMemory();
        };

        // Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
        MemoryManager.prototype.clearMemory = function (processID) {
            if (typeof processID === "undefined") { processID = -1; }
            // Clear specific processID of memory
            if (processID >= 0 && processID <= 2) {
                var baseAddress = processID * _MemoryConstants.PROCESS_SIZE;
                var limitAddress = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

                var startingRow = baseAddress / _MemoryConstants.BYTES_PER_ROW;
                var endingRow = Math.floor(limitAddress / _MemoryConstants.BYTES_PER_ROW);

                for (var i = startingRow; i <= endingRow; i++) {
                    for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                        this.memoryObject.memoryList[i][j] = "00";
                    }
                }

                // Clear tracking of used memory
                this.programsInUse[processID] = 0;
            } else {
                for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                    for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                        this.memoryObject.memoryList[i][j] = "00";
                    }
                }

                // Clear tracking of used memory
                this.programsInUse = [0, 0, 0];
            }
        };

        // Loads the program into physical memory or disks
        MemoryManager.prototype.loadProgram = function (byteList) {
            var memorySlotFound = false;

            for (var i = 0; i < this.programsInUse.length; i++) {
                if (this.programsInUse[i] === 0) {
                    var memorySlot = i;

                    // Check if disk does not hold same process name
                    var fileNamesOnDisk = _KrnFileSystemDriver.getFileNames();

                    var pidFound = false;
                    var currentPID = i;

                    while (!pidFound && fileNamesOnDisk.length !== 0) {
                        var correspondingFileName = ".process" + currentPID + ".swp";

                        for (var j = 0; j < fileNamesOnDisk.length; j++) {
                            if (fileNamesOnDisk[j] === correspondingFileName) {
                                // Check next PID
                                currentPID++;
                                break;
                            } else if ((j + 1) === fileNamesOnDisk.length) {
                                pidFound = true;
                            }
                        }
                    }

                    var processNumber = currentPID;

                    memorySlotFound = true;

                    break;
                }
            }

            // Load into memory
            if (memorySlotFound) {
                // Clear memory
                this.clearMemory(memorySlot);

                // Start at the beginning of the specified program section
                var baseAddress = memorySlot * _MemoryConstants.PROCESS_SIZE;
                var limitAddress = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

                var startingRow = baseAddress / _MemoryConstants.BYTES_PER_ROW;
                var endingRow = startingRow + Math.floor(byteList.length / _MemoryConstants.BYTES_PER_ROW);

                var index = 0;

                for (; startingRow <= endingRow; startingRow++) {
                    for (var colNumber = 0; colNumber < _MemoryConstants.NUM_COLUMNS; colNumber++) {
                        if (index < byteList.length) {
                            this.memoryObject.memoryList[startingRow][colNumber] = byteList[index];
                            index++;
                        }
                    }
                }

                // Reload memory display
                this.displayMemory();

                var newPCB = new TSOS.PCB(processNumber, baseAddress, limitAddress);
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
            } else {
                // Convert byteList into concatenated string
                var memoryContents = byteList.join("");

                for (var i = memoryContents.length / 2; i < _MemoryConstants.PROCESS_SIZE; i++) {
                    memoryContents += "00";
                }

                // Find available PID
                var processID = 0;
                var currentPID = 3;

                var pidFound = false;

                while (!pidFound) {
                    // PID not in use
                    if (this.pidsOnDisk.indexOf(currentPID) === -1) {
                        processID = currentPID;
                        pidFound = true;

                        // Add this processID to pidsOnDisk
                        this.pidsOnDisk.push(processID);
                    } else {
                        currentPID++;
                    }
                }

                // Create swap file
                var fileName = "process" + processID + ".swp";

                var createFileResult = _KrnFileSystemDriver.createFile(fileName, true);
                var writeFileResult = false;

                // File successfully created
                if (createFileResult) {
                    // Denote swap file as hidden
                    fileName = "." + fileName;

                    // Write memory contents to swap file
                    writeFileResult = _KrnFileSystemDriver.writeFile(fileName, memoryContents);

                    // Successful write to file
                    if (writeFileResult) {
                        var newPCB = new TSOS.PCB(processID);
                        newPCB.timeArrived = _OSclock; // Used in FCFS scheduling
                        newPCB.status = _ProcessStates.NEW; // Used for scheduling

                        // Set priority based off of size of program
                        newPCB.priority = byteList.length;

                        // Set location to disk
                        newPCB.location = _Locations.DISK;

                        _ResidentQueue.push(newPCB);

                        _StdOut.putText("Program loaded | PID " + processID + " created");

                        _KrnFileSystemDriver.displayFileSystem();
                    }
                }

                // Check if file was not created and / or written to
                if (!createFileResult && !writeFileResult) {
                    _StdOut.putText("Error! Couldn't load file: memory full.");
                }
            }
        };

        // Display the (potentially updated) memory in the browser
        MemoryManager.prototype.displayMemory = function () {
            var memoryTable = document.getElementById("mainMemory");

            while (memoryTable.rows.length > 0) {
                memoryTable.deleteRow(-1);
            }

            for (var rowNumber = 0; rowNumber < _MemoryConstants.NUM_ROWS; rowNumber++) {
                var newRow = memoryTable.insertRow(rowNumber);

                for (var columnNumber = 0; columnNumber < _MemoryConstants.NUM_COLUMNS + 1; columnNumber++) {
                    var cell = newRow.insertCell(columnNumber);

                    // First cell in the row; put the hex memory address
                    if (columnNumber === 0) {
                        // Multiply row number by 8 (each cell is a byte; 8 bytes per row)
                        var decimalValue = rowNumber * 8;
                        var hexValue = decimalValue.toString(16);

                        var stringLength = hexValue.length;

                        for (var m = 3; m > stringLength; m--) {
                            hexValue = "0" + hexValue;
                        }

                        hexValue = "0x" + hexValue;

                        cell.innerHTML = hexValue;
                    } else {
                        var cellValue = this.memoryObject.memoryList[rowNumber][columnNumber - 1];
                        cell.innerHTML = cellValue;
                    }
                }
            }
        };

        // Returns the value of the byte in memory using PC and PID
        MemoryManager.prototype.getByte = function (programCounter, processID) {
            // Valid address
            if (this.validateAddress(programCounter, processID)) {
                var rowNumber = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
                rowNumber += Math.floor(programCounter / _MemoryConstants.BYTES_PER_ROW);

                var columnNumber = programCounter % _MemoryConstants.BYTES_PER_ROW;

                return this.memoryObject.memoryList[rowNumber][columnNumber];
            } else {
                throw new TSOS.SystemException("Out of bounds memory access");
            }
        };

        // Writes a byte at the given address
        MemoryManager.prototype.writeData = function (address, inputValue, processID) {
            // Convert memoryAddress to hex
            var hexAddress = parseInt(address, 16);

            // Valid address
            if (this.validateAddress(hexAddress, processID)) {
                var rowNumber = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
                rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

                var columnNumber = hexAddress % _MemoryConstants.BYTES_PER_ROW;

                // Convert input value to hex
                var valueString = inputValue.toString(16);

                // Pad inputValue if necessary
                if (valueString.length === 1) {
                    valueString = "0" + valueString;
                }

                var properString = TSOS.Utils.toUpperHex(valueString);

                // Write value to memory
                this.memoryObject.memoryList[rowNumber][columnNumber] = properString;
            } else {
                throw new TSOS.SystemException("Out of bounds memory access");
            }
        };

        // Returns the byte at the given address
        MemoryManager.prototype.getData = function (address, processID) {
            // Convert address to hex
            var hexAddress = parseInt(address, 16);

            // Valid address
            if (this.validateAddress(hexAddress, processID)) {
                var rowNumber = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
                rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

                var columnNumber = hexAddress % _MemoryConstants.BYTES_PER_ROW;

                return this.memoryObject.memoryList[rowNumber][columnNumber];
            } else {
                throw new TSOS.SystemException("Out of bounds memory access");
            }
        };

        // Returns the contents of memory as a concatenated string
        MemoryManager.prototype.getMemoryContents = function (processID) {
            var pcbFound = false;

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                var currentPCB = _ReadyQueue.q[i];

                // PCB found and it was in memory
                if (currentPCB.processID === processID && currentPCB.location === _Locations.MEMORY) {
                    pcbFound = true;
                }
            }

            if (pcbFound) {
                var outputString = "";

                var startingRow = currentPCB.baseRegister / _MemoryConstants.BYTES_PER_ROW;
                var endingRow = Math.floor(currentPCB.limitRegister / _MemoryConstants.BYTES_PER_ROW);

                for (var currentRow = startingRow; currentRow <= endingRow; currentRow++) {
                    for (var currentColumn = 0; currentColumn < _MemoryConstants.NUM_COLUMNS; currentColumn++) {
                        // Concatenate memory contents to outputString
                        outputString += this.memoryObject.memoryList[currentRow][currentColumn];
                    }
                }

                return outputString;
            } else {
                return "";
            }
        };

        // Put the contents of memory from a PCB on disk back into memory.
        // Return memorySlot where program was placed
        MemoryManager.prototype.putMemoryContents = function (byteList, memorySlot) {
            // Update PCB with slot it is stored in
            var base = memorySlot * _MemoryConstants.PROCESS_SIZE;
            var limit = base + _MemoryConstants.PROCESS_SIZE - 1;

            var startingRow = base / _MemoryConstants.BYTES_PER_ROW;
            var endingRow = Math.floor(limit / _MemoryConstants.BYTES_PER_ROW);

            var index = 0;

            for (var currentRow = startingRow; currentRow <= endingRow; currentRow++) {
                for (var currentColumn = 0; currentColumn < _MemoryConstants.NUM_COLUMNS; currentColumn++) {
                    this.memoryObject.memoryList[currentRow][currentColumn] = byteList[index];
                    index++;
                }
            }

            this.programsInUse[memorySlot] = 1;

            return true;
        };

        // Determines if a given address is within a processID's memory limit
        MemoryManager.prototype.validateAddress = function (address, processID) {
            var pcbBase = _CurrentPCB.baseRegister;
            var pcbLimit = _CurrentPCB.limitRegister;

            var adjustedAddress = pcbBase + address;

            // Valid address
            if (adjustedAddress >= pcbBase && adjustedAddress <= pcbLimit) {
                return true;
            } else {
                return false;
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
