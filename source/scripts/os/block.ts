module TSOS {
	export class Block {

		public track: number;
		public sector: number;
		public block: number;

		public inUse: boolean;

		public nextTrack: string;
		public nextSector: string;
		public nextBlock: string;

		public data: string;

		constructor(key: string, blockData: string) {

			// Parse out each component of the block
			var inUseString: string = blockData.charAt(0);

			if(inUseString === "0") {
				this.inUse = false;
			}

			else {
				this.inUse = true;
			}

			this.track = parseInt(key.charAt(0), 10);
			this.sector = parseInt(key.charAt(1), 10);
			this.block = parseInt(key.charAt(2), 10);

			this.nextTrack = blockData.charAt(1);
			this.nextSector = blockData.charAt(2);
			this.nextBlock = blockData.charAt(3);

			this.data = blockData.substring(4);
		}
	}
}