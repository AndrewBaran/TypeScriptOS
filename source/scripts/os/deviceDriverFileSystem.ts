///<reference path="deviceDriver.ts" />

module TSOS {
	export class DeviceDriverFileSystem extends DeviceDriver {

		constructor() {
			super(this.krnFSDDEntry, null);
		}

		public krnFSDDEntry(): void {

			this.status = "loaded";
		}

		public initializeStorage(): void {

			for(var trackNumber: number = 0; trackNumber < _FileConstants.NUM_TRACKS; trackNumber++) {
				for(var sectorNumber: number = 0; sectorNumber < _FileConstants.NUM_SECTORS; sectorNumber++) {
					for(var blockNumber: number = 0; blockNumber < _FileConstants.NUM_BLOCKS; blockNumber++) {

						// Create key as tsb
						var key: string = "";
						key += trackNumber.toString();
						key += sectorNumber.toString();
						key += blockNumber.toString();

						// Create value as default string of 64 -'s
						// TODO

						console.log(key);
						sessionStorage.setItem(key, "")

					}
				}
			}
		}

	}
}