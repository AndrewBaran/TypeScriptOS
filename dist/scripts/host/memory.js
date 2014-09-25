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
            TSOS.Display.displayMemory();

            // TODO Create a PCB and print the process ID
            var newPCB = new TSOS.PCB(processNumber, baseAddress, limitAddress, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting);
            _PCBList.push(newPCB);

            _StdOut.putText("Program loaded | PID " + processNumber + " created");
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
