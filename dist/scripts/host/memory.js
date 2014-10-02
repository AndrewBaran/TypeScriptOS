var TSOS;
(function (TSOS) {
    var Memory = (function () {
        // Constructors
        function Memory() {
            this.memoryList = new Array(_MemoryConstants.NUM_ROWS);
            for (var i = 0; i < _MemoryConstants.NUM_ROWS; i++) {
                this.memoryList[i] = new Array(_MemoryConstants.NUM_COLUMNS);
            }
        }
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
