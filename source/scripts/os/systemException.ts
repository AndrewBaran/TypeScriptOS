module TSOS {
	export class SystemException {

		// Fields
		public name: string;
		public message: string;

		// Constructors
		constructor(message: string) {
			this.name = "SystemException";
			this.message = message;
		}

	}
}