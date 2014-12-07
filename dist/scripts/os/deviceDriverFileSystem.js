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
                        block.data = block.data.replace(/-/g, "0");

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

            // Check if file already on disk
            var fileNamesOnDisk = this.getFileNames();
            var fileNameFound = false;

            for (var i = 0; i < fileNamesOnDisk.length; i++) {
                if (fileNamesOnDisk[i] === fileName) {
                    fileNameFound = true;
                    break;
                }
            }

            // Duplicate file found; don't create it
            if (fileNameFound) {
                _Kernel.krnTrace("Error! Duplicate file found.");
                return false;
            } else if (directoryBlockFound && dataBlockFound) {
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

                // Set dataBlock next t,s,b to -
                currentDataBlock.nextTrack = "-";
                currentDataBlock.nextSector = "-";
                currentDataBlock.nextBlock = "-";

                // Set dataBlock data to all -'s
                var dataString = "";

                for (var i = 0; i < _FileConstants.DATA_SIZE; i++) {
                    dataString += "-";
                }

                currentDataBlock.data = dataString;

                // Update storage of these two blocks
                this.updateBlock(currentDirectoryBlock);
                this.updateBlock(currentDataBlock);

                return true;
            } else {
                // Let shell.ts handle error message
                return false;
            }
        };

        // Reads the inputFile and returns its contents to the caller
        DeviceDriverFileSystem.prototype.readFile = function (fileName) {
            var directoryBlockFound = false;

            for (var trackNumber = 0; trackNumber < 1; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        // Skip master boot record
                        if (trackNumber === 0 && sectorNumber === 0 && blockNumber === 0) {
                            continue;
                        }

                        var currentDirectoryBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        var dataString = TSOS.Utils.hexToString(currentDirectoryBlock.data);

                        if (dataString === fileName) {
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

            var outputString = "";
            var stillReading = true;

            var key = currentDirectoryBlock.nextTrack + currentDirectoryBlock.nextSector + currentDirectoryBlock.nextBlock;

            while (stillReading) {
                // Get data block
                var track = parseInt(key.charAt(0), 10);
                var sector = parseInt(key.charAt(1), 10);
                var block = parseInt(key.charAt(2), 10);

                var dataBlock = this.getBlock(track, sector, block);

                var dataString = TSOS.Utils.hexToString(dataBlock.data);

                outputString += dataString;

                // Check if at end of block chain
                if (dataBlock.nextTrack === "-" || dataBlock.nextSector === "-" || dataBlock.nextBlock === "-") {
                    stillReading = false;
                } else {
                    key = dataBlock.nextTrack + dataBlock.nextSector + dataBlock.nextBlock;
                }
            }

            return outputString;
        };

        // Write the contents to the specified file
        DeviceDriverFileSystem.prototype.writeFile = function (fileName, contentToWrite) {
            var directoryBlockFound = false;

            for (var trackNumber = 0; trackNumber < 1; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        var currentDirectoryBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        var dataString = TSOS.Utils.hexToString(currentDirectoryBlock.data);

                        if (currentDirectoryBlock.inUse && (dataString === fileName)) {
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

            if (directoryBlockFound) {
                var track = parseInt(currentDirectoryBlock.nextTrack, 10);
                var sector = parseInt(currentDirectoryBlock.nextSector, 10);
                var block = parseInt(currentDirectoryBlock.nextBlock, 10);

                var dataBlock = this.getBlock(track, sector, block);

                // Erase contents before writing
                this.eraseBlockChain(dataBlock);

                var stillWriting = true;

                while (contentToWrite.length > 0 && stillWriting) {
                    var currentContent = contentToWrite.substring(0, _FileConstants.DATA_SIZE);
                    contentToWrite = contentToWrite.substring(_FileConstants.DATA_SIZE);

                    // Convert currentContent to hex
                    var hexString = TSOS.Utils.stringToHex(currentContent);

                    dataBlock.data = hexString;

                    // Write data back to session storage
                    this.updateBlock(dataBlock);

                    // No more content to write
                    if (contentToWrite.length === 0) {
                        stillWriting = false;
                    } else {
                        // Find a new block
                        var nextDataBlock = this.findNewBlock();

                        // Can't find new block to write to
                        if (nextDataBlock === null) {
                            return false;
                        }

                        // Set currentDataBlock to point to the nextDataBlock
                        dataBlock.nextTrack = nextDataBlock.track.toString();
                        dataBlock.nextSector = nextDataBlock.sector.toString();
                        dataBlock.nextBlock = nextDataBlock.block.toString();

                        // Set nextDataBlock to in use
                        nextDataBlock.inUse = true;

                        // Set nextDataBlock to point to no other block
                        nextDataBlock.nextTrack = "-";
                        nextDataBlock.nextSector = "-";
                        nextDataBlock.nextBlock = "-";

                        // Store these blocks back into storage
                        this.updateBlock(dataBlock);
                        this.updateBlock(nextDataBlock);

                        // Set dataBlock to this nextDataBlock
                        dataBlock = nextDataBlock;
                    }
                }

                return true;
            } else {
                _Kernel.krnTrace("Error! File " + fileName + " could not be found to write to.");
            }
        };

        // Deletes a file from the disk
        DeviceDriverFileSystem.prototype.deleteFile = function (fileName) {
            // Find corresponding directory block
            var directoryBlockFound = false;

            for (var trackNumber = 0; trackNumber < 1; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        var currentDirectoryBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);
                        var dataString = TSOS.Utils.hexToString(currentDirectoryBlock.data);

                        if (dataString === fileName) {
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

            // Get first block of this file
            var track = parseInt(currentDirectoryBlock.nextTrack, 10);
            var sector = parseInt(currentDirectoryBlock.nextSector, 10);
            var block = parseInt(currentDirectoryBlock.nextBlock, 10);

            var dataBlock = this.getBlock(track, sector, block);

            // Delete the block and its associated chain
            this.eraseBlockChain(dataBlock, true);

            // Set the directory block to not in use
            currentDirectoryBlock.inUse = false;

            this.updateBlock(currentDirectoryBlock);

            return true;
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

        // Searches for an available block in the data section on the disk
        DeviceDriverFileSystem.prototype.findNewBlock = function () {
            for (var trackNumber = 1; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        var currentDataBlock = this.getBlock(trackNumber, sectorNumber, blockNumber);

                        // Available block
                        if (!currentDataBlock.inUse) {
                            return currentDataBlock;
                        }
                    }
                }
            }

            // No available blocks found
            return null;
        };

        // Sets each block in a block chain (including first block when deleting) to not in use
        DeviceDriverFileSystem.prototype.eraseBlockChain = function (startingBlock, deletingFile) {
            if (typeof deletingFile === "undefined") { deletingFile = false; }
            var currentBlock = null;
            var stillErasing = false;

            // Edge case for first block
            if (deletingFile) {
                startingBlock.inUse = false;
                this.updateBlock(startingBlock);
            }

            // One block; don't do anything
            if (startingBlock.nextTrack === "-" || startingBlock.nextSector === "-" || startingBlock.nextBlock === "-") {
                return;
            } else {
                var track = parseInt(startingBlock.nextTrack, 10);
                var sector = parseInt(startingBlock.nextSector, 10);
                var block = parseInt(startingBlock.nextBlock, 10);

                currentBlock = this.getBlock(track, sector, block);

                stillErasing = true;
            }

            while (stillErasing) {
                currentBlock.inUse = false;

                this.updateBlock(currentBlock);

                if (currentBlock.nextTrack === "-" || currentBlock.nextSector === "-" || currentBlock.nextBlock === "-") {
                    stillErasing = false;
                } else {
                    var track = parseInt(currentBlock.nextTrack, 10);
                    var sector = parseInt(currentBlock.nextSector, 10);
                    var block = parseInt(currentBlock.nextBlock, 10);

                    currentBlock = this.getBlock(track, sector, block);
                }
            }
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
