var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        // Constructors
        function MemoryManager() {
            this.memoryObject = null;
            this.programsInUse = [0, 0, 0];
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
            if (processID >= 0 && processID < 3) {
                var baseAddress = processID * _MemoryConstants.PROCESS_SIZE;
                var limitAddress = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

                var startingRow = baseAddress / _MemoryConstants.BYTES_PER_ROW;
                var endingRow = Math.floor(limitAddress / 8);

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

        // Load the program into physical memory; default process block = 0
        MemoryManager.prototype.loadProgram = function (byteList) {
            for (var i = 0; i < this.programsInUse.length; i++) {
                if (this.programsInUse[i] === 0) {
                    var processNumber = i;
                    break;
                }
            }

            // Clear memory
            this.clearMemory(processNumber);

            // Start at the beginning of the specified program section
            var baseAddress = processNumber * _MemoryConstants.PROCESS_SIZE;
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
            newPCB.timeArrived = _OSclock; // Used in scheduling

            _ResidentQueue.push(newPCB);

            // Keep track of where program is loaded
            this.programsInUse[processNumber] = 1;

            _StdOut.putText("Program loaded | PID " + processNumber + " created");
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
            var rowNumber = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
            rowNumber += Math.floor(programCounter / _MemoryConstants.BYTES_PER_ROW);

            var columnNumber = programCounter % _MemoryConstants.BYTES_PER_ROW;

            return this.memoryObject.memoryList[rowNumber][columnNumber];
        };

        // TODO BSOD or something if invalid memory access
        MemoryManager.prototype.writeData = function (address, inputValue, processID) {
            // Convert memoryAddress to hex
            var hexAddress = parseInt(address, 16);

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
        };

        // TODO BSOD or something if invalid memory access
        // TODO This seems unnecessary
        MemoryManager.prototype.getData = function (address, processID) {
            var hexAddress = parseInt(address, 16);

            var rowNumber = (processID * _MemoryConstants.PROCESS_SIZE) / _MemoryConstants.BYTES_PER_ROW;
            rowNumber += Math.floor(hexAddress / _MemoryConstants.BYTES_PER_ROW);

            var columnNumber = hexAddress % _MemoryConstants.BYTES_PER_ROW;

            return this.memoryObject.memoryList[rowNumber][columnNumber];
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
