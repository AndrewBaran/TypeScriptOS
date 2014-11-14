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
                        var key = "";
                        key += trackNumber.toString();
                        key += sectorNumber.toString();
                        key += blockNumber.toString();

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

                        // In Use
                        var inUseCell = newRow.insertCell();
                        inUseCell.innerHTML = "0";

                        // Data
                        var dataKey = trackNumber.toString() + sectorNumber.toString() + blockNumber.toString();
                        var dataValue = sessionStorage.getItem(dataKey);

                        var dataCell = newRow.insertCell();
                        dataCell.innerHTML = dataValue.toString();
                    }
                }
            }
        };

        // Creates a file in the file system
        DeviceDriverFileSystem.prototype.createFile = function (fileName) {
            return true;
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
