// TODO Should this be in the OS folder?
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
        }
        Memory.initializeMemory = function () {
            TSOS.Memory.memoryList = new Array(_MemoryConstants.NUM_ROWS);
            for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                TSOS.Memory.memoryList[i] = new Array(_MemoryConstants.NUM_COLUMNS);
            }

            TSOS.Memory.clearMemory();

            // Display memory view in browser
            // TODO move this to Display.ts
            TSOS.Memory.displayMemory();
        };

        // Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
        Memory.clearMemory = function (sector) {
            if (typeof sector === "undefined") { sector = -1; }
            // TODO Implement
            // Clear specific sector of memory
            if (sector >= 0) {
            } else {
                for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                    for (var j = 1; j < _MemoryConstants.NUM_COLUMNS; j++) {
                        TSOS.Memory.memoryList[i][j] = "00";
                    }
                }
            }
        };

        // Displays the (potentially updated) view of the memory in the browser
        Memory.displayMemory = function () {
            var memoryTable = document.getElementById("mainMemory");

            for (var rowNumber = 0; rowNumber < _MemoryConstants.NUM_ROWS; rowNumber++) {
                var newRow = memoryTable.insertRow(rowNumber);

                for (var columnNumber = 0; columnNumber < _MemoryConstants.NUM_COLUMNS; columnNumber++) {
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
                        var cellValue = TSOS.Memory.memoryList[rowNumber][columnNumber];
                        cell.innerHTML = cellValue;
                    }
                }
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
