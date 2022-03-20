namespace TwinKleS {

	// ------------------------------------------------

	export class MyError {

		private message: string;
		private stack: string;

		constructor(
			message: string,
		) {
			let stack = new Error().stack!;
			stack = stack.substring(stack.indexOf('\n') + 1, stack.length - 1);
			this.message = message;
			this.stack = stack;
		}

		toString(): string {
			return `${this.message}\n${this.stack}`;
		}

	}

	// ------------------------------------------------

}