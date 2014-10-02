module TSOS {

	export class Memory {

		// Fields
		public memoryList: string[][];

		// Constructors
		constructor() {

			this.memoryList = new Array(_MemoryConstants.NUM_ROWS);
			for(var i: number = 0; i < _MemoryConstants.NUM_ROWS; i++) {
				this.memoryList[i] = new Array(_MemoryConstants.NUM_COLUMNS);
			}
			
		}
	}
}