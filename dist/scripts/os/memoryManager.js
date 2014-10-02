var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        // Methods
        MemoryManager.prototype.initializeMemory = function () {
            _Memory = new TSOS.Memory();
            this.clearMemory();
        };

        // Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
        MemoryManager.prototype.clearMemory = function (processNumber) {
            if (typeof processNumber === "undefined") { processNumber = -1; }
            // TODO Implement
            // Clear specific processNumber of memory
            if (processNumber >= 0) {
            } else {
                for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                    for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                        _Memory.memoryList[i][j] = "00";
                    }
                }
            }
        };

        MemoryManager.prototype.loadProgram = function (byteList, processNumber) {
            if (typeof processNumber === "undefined") { processNumber = 0; }
            // Start at the beginning of the specified program section
            var baseAddress = processNumber * _MemoryConstants.PROCESS_SIZE;
            var limitAddress = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

            var startingRow = baseAddress % _MemoryConstants.BYTES_PER_ROW;
            var endingRow = startingRow + Math.floor(byteList.length / _MemoryConstants.BYTES_PER_ROW);

            for (; startingRow <= endingRow; startingRow++) {
                for (var colNumber = 0; colNumber < _MemoryConstants.NUM_COLUMNS; colNumber++) {
                    var index = (startingRow * _MemoryConstants.BYTES_PER_ROW) + colNumber;

                    if (index < byteList.length) {
                        _Memory.memoryList[startingRow][colNumber] = byteList[index];
                    }
                }
            }

            // Reload memory display
            this.displayMemory();

            var newPCB = new TSOS.PCB(processNumber, baseAddress, limitAddress, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting);
            _PCBList.push(newPCB);

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
                        var cellValue = _Memory.memoryList[rowNumber][columnNumber - 1];
                        cell.innerHTML = cellValue;
                    }
                }
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
