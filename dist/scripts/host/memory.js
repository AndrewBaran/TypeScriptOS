var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
        }
        Memory.initializeMemory = function () {
            // TODO Not working
            // TSOS.Memory.clearMemory();
            // Get the table id
            var memoryTable = document.getElementById("mainMemory");
            console.log(memoryTable);

            for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                // Create a new row
                var row = memoryTable.insertRow(i);

                for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                    // Create a new cell for each cell at position j
                    var cell = row.insertCell(j);

                    // First cell in the row; put the hex memory address
                    if (j === 0) {
                        // Multiply row number by 8 (each cell is a byte; 8 bytes per row)
                        var decimalValue = i * 8;
                        var hexValue = decimalValue.toString(16);

                        var stringLength = hexValue.length;

                        for (var m = 3; m > stringLength; m--) {
                            hexValue = "0" + hexValue;
                        }

                        hexValue = "0x" + hexValue;

                        cell.innerHTML = hexValue;
                    } else {
                        // Get value from 2d-array of memory and put it here
                        // TODO
                        cell.innerHTML = "FF";
                    }
                }
            }
        };

        // Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
        Memory.clearMemory = function (sector) {
            if (typeof sector === "undefined") { sector = -1; }
            console.log("In clearMemory()");

            // TODO Implement
            // Clear specific sector of memory
            if (sector >= 0) {
            } else {
                for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                    for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                        TSOS.Memory.memoryList[i][j] = "";
                    }
                }
            }
        };

        // TODO I feel like I need this
        Memory.displayMemory = function () {
            console.log("In displayMemory()");
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
