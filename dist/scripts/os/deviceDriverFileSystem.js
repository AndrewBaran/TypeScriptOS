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
            for (var trackNumber = 0; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
                for (var sectorNumber = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
                    for (var blockNumber = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {
                        // Create key as tsb
                        var key = "";
                        key += trackNumber.toString();
                        key += sectorNumber.toString();
                        key += blockNumber.toString();

                        // Create value as default string of 64 -'s
                        // TODO
                        console.log(key);
                        sessionStorage.setItem(key, "");
                    }
                }
            }
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
