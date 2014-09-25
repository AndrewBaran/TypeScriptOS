// TODO Should this be in the OS folder?
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        // Constructors
        function Memory() {
            this.memoryList = new Array(_MemoryConstants.NUM_ROWS);
            for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                this.memoryList[i] = new Array(_MemoryConstants.NUM_COLUMNS);
            }

            this.clearMemory();
        }
        // Takes an optional parameter that clears a specific part of memory; otherwise, clear all memory
        Memory.prototype.clearMemory = function (processNumber) {
            if (typeof processNumber === "undefined") { processNumber = -1; }
            // TODO Implement
            // Clear specific processNumber of memory
            if (processNumber >= 0) {
            } else {
                for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                    for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                        this.memoryList[i][j] = "00";
                    }
                }
            }
        };

        Memory.prototype.loadProgram = function (byteList, processNumber) {
            if (typeof processNumber === "undefined") { processNumber = 0; }
            // Start at the beginning of the specified program section
            var baseAddress = processNumber * _MemoryConstants.PROCESS_SIZE;
            var limitAddress = baseAddress + _MemoryConstants.PROCESS_SIZE - 1;

            console.log("Base = " + baseAddress);
            console.log("Limit = " + limitAddress);

            for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                for (var j = 0; j < _MemoryConstants.NUM_COLUMNS; j++) {
                }
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
