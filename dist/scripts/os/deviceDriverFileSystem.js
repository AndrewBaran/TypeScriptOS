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
                // Set inuse, and next t,s,b to 0
                if (i >= 0 && i <= 3) {
                    defaultValue += "0";
                } else {
                    defaultValue += "--";
                }
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

                        // Replace all the occurences of - with 0 to display
                        // block.data.replace(/-/g, "0");
                        // Data
                        var dataCell = newRow.insertCell();
                        dataCell.innerHTML = block.data;
                    }
                }
            }
        };

        // Returns an array of strings holding each file name
        DeviceDriverFileSystem.prototype.getFileNames = function () {
            var outputFileNames = [];

            for (var trackNumber = 0; trackNumber < 1; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        // Skip master boot record
                        if (trackNumber === 0 && sectorNumber === 0 && blockNumber === 0) {
                            continue;
                        }

                        // Check if block is in use
                        var currentDirectoryBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        if (currentDirectoryBlock.inUse) {
                            // Get fileName
                            var hexFileName = "";

                            var index = 0;
                            var currentChar = "";

                            while ((currentChar = currentDirectoryBlock.data.charAt(index)) != "-") {
                                hexFileName += currentChar;
                                index++;
                            }

                            var fileName = TSOS.Utils.hexToString(hexFileName);

                            outputFileNames.push(fileName);
                        }
                    }
                }
            }

            return outputFileNames;
        };

        // TODO Make it so dupliciate file name writes over previous file name
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
                            console.log("Data block at (" + trackNumber + ", " + sectorNumber + ", " + blockNumber + ") is free.");
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
                        // Skip master boot record
                        if (trackNumber === 0 && sectorNumber === 0 && blockNumber === 0) {
                            continue;
                        }

                        var currentDirectoryBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        if (!currentDirectoryBlock.inUse) {
                            console.log("Directory block at (" + trackNumber + ", " + sectorNumber + ", " + blockNumber + ") is free.");
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
                var hexString = TSOS.Utils.stringToHex(fileName);

                // Set directoryBlock.data to the hex fileName
                currentDirectoryBlock.data = hexString;

                // Set currentDirectoryBlock to in use
                currentDirectoryBlock.inUse = true;

                // Set currentDirectoryBlock to point to dataBlock
                currentDirectoryBlock.nextTrack = currentDataBlock.track.toString();
                currentDirectoryBlock.nextSector = currentDataBlock.sector.toString();
                currentDirectoryBlock.nextBlock = currentDataBlock.block.toString();

                // Set dataBlock to in use
                currentDataBlock.inUse = true;

                // Update storage of these two blocks
                this.updateBlock(currentDirectoryBlock);
                this.updateBlock(currentDataBlock);

                return true;
            } else {
                // Let shell.ts handle error message
                return false;
            }
        };

        // Resets the disk to default state
        DeviceDriverFileSystem.prototype.formatDisk = function () {
            this.initializeStorage();
        };

        // Gets the block at the specified track, sector, and block
        DeviceDriverFileSystem.prototype.getBlock = function (track, sector, block) {
            var key = track.toString() + sector.toString() + block.toString();
            var blockData = sessionStorage.getItem(key);

            var newBlock = new TSOS.Block(key, blockData);

            return newBlock;
        };

        // Takes a Block object and updates the session storage version of it
        DeviceDriverFileSystem.prototype.updateBlock = function (inputBlock) {
            var blockData = "";

            if (inputBlock.inUse) {
                blockData += "1";
            } else {
                blockData += "0";
            }

            blockData += inputBlock.nextTrack;
            blockData += inputBlock.nextSector;
            blockData += inputBlock.nextBlock;

            blockData += inputBlock.data;

            for (var i = inputBlock.data.length / 2; i < _FileConstants.DATA_SIZE; i++) {
                blockData += "--";
            }

            var key = inputBlock.track.toString() + inputBlock.sector.toString() + inputBlock.block.toString();
            sessionStorage.setItem(key, blockData);

            return true;
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
