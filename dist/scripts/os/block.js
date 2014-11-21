var TSOS;
(function (TSOS) {
    var Block = (function () {
        function Block(key, blockData) {
            // Parse out each component of the block
            var inUseString = blockData.charAt(0);

            if (inUseString === "0") {
                this.inUse = false;
            } else {
                this.inUse = true;
            }

            this.nextTrack = blockData.charAt(1);
            this.nextSector = blockData.charAt(2);
            this.nextBlock = blockData.charAt(3);

            this.data = blockData.substring(4);
        }
        return Block;
    })();
    TSOS.Block = Block;
})(TSOS || (TSOS = {}));
