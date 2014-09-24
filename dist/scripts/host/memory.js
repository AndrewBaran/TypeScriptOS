var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            // TODO Fill in
        }
        Memory.initializeMemory = function () {
            console.log("In initializeMemory()");

            // Get the table id
            var memoryTable = (document.getElementById("mainMemory"));
            console.log(memoryTable);

            TSOS.Memory.clearMemory();

            // Display memory
            var testRow = (memoryTable.insertRow(0));
            var cell1 = testRow.insertCell(0);
            cell1.innerHTML = "0x000";

            var cell2 = testRow.insertCell(1);
            cell2.innerHTML = "FF";
            TSOS.Memory.clearMemory();
        };

        // Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
        Memory.clearMemory = function (sector) {
            if (typeof sector === "undefined") { sector = -1; }
            // TODO Implement
            // Clear specific sector of memory
            if (sector >= 0) {
            } else {
                for (var i = 0; i < _MemoryConstants.NUM_COLUMNS; i++) {
                    for (var j = 0; j < _MemoryConstants.NUM_ROWS; j++) {
                        TSOS.Memory.memoryList[i][j] = "";
                    }
                }
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
