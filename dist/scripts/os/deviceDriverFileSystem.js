///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            _super.call(this, this.krnFSDDEntry, null);
        }
        DeviceDriverFileSystem.prototype.krnFSDDEntry = function () {
            this.status = "loaded";
        };

        DeviceDriverFileSystem.prototype.initializeStorage = function () {
            var defaultValue = "";

            for (var i = 0; i < _FileConstants.BLOCK_SIZE; i++) {
                defaultValue += "-";
            }

            for (var trackNumber = 0; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        // Create key as tsb
                        var key = trackNumber.toString() + sectorNumber.toString() + blockNumber.toString();

                        sessionStorage.setItem(key, defaultValue);
                    }
                }
            }
        };

        DeviceDriverFileSystem.prototype.displayFileSystem = function () {
            var table = document.getElementById("tableFileSystem");

            while (table.rows.length > 1) {
                table.deleteRow(-1);
            }

            for (var trackNumber = 0; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        // Create new row
                        var newRow = table.insertRow();

                        // Track
                        var trackCell = newRow.insertCell();
                        trackCell.innerHTML = trackNumber.toString();

                        // Sector
                        var sectorCell = newRow.insertCell();
                        sectorCell.innerHTML = sectorNumber.toString();

                        // Block
                        var blockCell = newRow.insertCell();
                        blockCell.innerHTML = blockNumber.toString();

                        // Create a block object
                        var block = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        // In Use
                        var inUseCell = newRow.insertCell();
                        if (block.inUse) {
                            inUseCell.innerHTML = "1";
                        } else {
                            inUseCell.innerHTML = "0";
                        }

                        // Next Track, Sector, and Block (for chaining)
                        var nextTrackCell = newRow.insertCell();
                        nextTrackCell.innerHTML = block.nextTrack;

                        var nextSector = newRow.insertCell();
                        nextSector.innerHTML = block.nextSector;

                        var nextBlock = newRow.insertCell();
                        nextBlock.innerHTML = block.nextBlock;

                        // Data
                        var dataCell = newRow.insertCell();
                        dataCell.innerHTML = block.data;
                    }
                }
            }
        };

        // Creates a file in the file system
        DeviceDriverFileSystem.prototype.createFile = function (fileName, hiddenFile) {
            // Add invalid character to file name to prevent Alan from deleting the file
            if (hiddenFile) {
                fileName = "." + fileName;
            }

            var dataBlockFound = false;

            for (var trackNumber = 1; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        // Get data from current block
                        var currentDataBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        if (!currentDataBlock.inUse) {
                            console.log("Block at (" + trackNumber + ", " + sectorNumber + ", " + blockNumber + ") is free.");
                            dataBlockFound = true;

                            break;
                        }
                    }

                    if (dataBlockFound) {
                        break;
                    }
                }

                if (dataBlockFound) {
                    break;
                }
            }

            var directoryBlockFound = false;

            for (var trackNumber = 0; trackNumber < 1; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        var currentDirectoryBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        if (!currentDirectoryBlock.inUse) {
                            directoryBlockFound = true;

                            break;
                        }
                    }

                    if (directoryBlockFound) {
                        break;
                    }
                }

                if (directoryBlockFound) {
                    break;
                }
            }

            // Add file to system
            if (directoryBlockFound && dataBlockFound) {
                // Convert the fileName to hex
                // Set directoryBlock.data to the hex fileName
                // Set directoryBlock to in use
                // Set directoryBlock to point to dataBlock
                // Set dataBlock to in use
                return true;
            } else {
                // Let shell.ts handle error messages
                return false;
            }
        };

        DeviceDriverFileSystem.prototype.getBlock = function (track, sector, block) {
            var key = track.toString() + sector.toString() + block.toString();
            var blockData = sessionStorage.getItem(key);

            var newBlock = new TSOS.Block(key, blockData);

            return newBlock;
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
