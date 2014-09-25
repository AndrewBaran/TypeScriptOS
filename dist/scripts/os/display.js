var TSOS;
(function (TSOS) {
    var Display = (function () {
        function Display() {
        }
        // TODO Probably a smoother way to do this
        Display.displayCPU = function () {
            var cpuInfoTable = document.getElementById("cpuStatus");

            while (cpuInfoTable.rows.length > 0) {
                cpuInfoTable.deleteRow(-1);
            }

            for (var i = 0; i < 2; i++) {
                var newRow = cpuInfoTable.insertRow(i);

                for (var j = 0; j < 5; j++) {
                    var newCell = newRow.insertCell(j);
                    var value = "";

                    // Display header
                    if (i === 0) {
                        value = Object.keys(_CPU)[j];
                    } else {
                        var key = Object.keys(_CPU)[j];
                        value = _CPU[key];
                    }

                    newCell.innerHTML = value;
                }
            }
        };

        Display.displayMemory = function () {
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
        return Display;
    })();
    TSOS.Display = Display;
})(TSOS || (TSOS = {}));
