/** 命令执行器 */
namespace TwinKleS.Executor {

	// ------------------------------------------------

	/** 命令 */
	export type Command = {
		/** 输入值 */
		input: string;
		/** 指定的建议ID；若指定，则在执行时直接选用指定ID的建议，而不等待用户选择；指定建议绕过过滤器，不论输入值是否可被该建议过滤器通过 */
		suggestion: null | string;
		/** 关闭建议的过滤器功能；若指定，则（在未指定建议时）在筛选可用建议时不使用过滤器功能，所有建议都会进入待选表 */
		disable_suggestion_filter: boolean;
		/** 附加选项；将会传递给建议的过滤器与处理器 */
		option: Record<string, any>;
	};

	/** 建议 */
	export type Suggestion = {
		/** 建议ID；用于在命令中指定建议，应唯一 */
		id: string;
		/** 建议说明；在等待用户选择建议时，将显示此信息 */
		description: string;
		/** 过滤器；根据命令的输入值与附加选项判断此建议是否未可进入待选表 */
		filter(input: Command['input'], option: Command['option']): boolean;
		/** 处理器；当选用此建议时调用，应在此进行需执行的事务 */
		worker(input: Command['input'], option: Command['option']): void;
	};

	// ------------------------------------------------

	/**
	 * 解析字符串列表形式的命令
	 * @param raw_command 字符串
	 * @returns 解析所得的命令
	 */
	export function parse(
		raw_command: string[],
	): Command[] {
		let result: Command[] = [];
		let i = 0;
		while (i < raw_command.length) {
			let command: Command = {
				input: raw_command[i++],
				suggestion: null,
				disable_suggestion_filter: false,
				option: {},
			};
			if (i < raw_command.length && raw_command[i] === '-suggestion') {
				++i;
				command.suggestion = raw_command[i++];
			}
			if (i < raw_command.length && raw_command[i] === '-disable_suggestion_filter') {
				++i;
				command.disable_suggestion_filter = true;
			}
			if (i < raw_command.length && raw_command[i] === '-option') {
				++i;
				let option = JSON.parse(raw_command[i++]);
				if (typeof option !== 'object' || (option as Object).constructor.name !== 'Object') {
					throw new MyError(`TwinKleS.Executor.parse : option must be a object`);
				}
				command.option = option;
			}
			result.push(command);
		}
		return result;
	}

	/**
	 * 执行命令
	 * @param command 命令
	 * @param suggestion 可能待选的建议列表
	 */
	export function execute(
		command: Command,
		suggestion: Suggestion[],
	): void {
		let selected_suggestion: Suggestion | undefined;
		if (command.suggestion !== null) {
			selected_suggestion = suggestion.find((e) => (e.id === command.suggestion));
			if (selected_suggestion === undefined) {
				throw new MyError(`TwinKleS.Executor.execute : invalid suggesstion id`);
			}
		} else {
			let valid_suggestion_index: number[] = [];
			for (let i in suggestion) {
				if (command.disable_suggestion_filter || suggestion[i].filter(command.input, command.option)) {
					valid_suggestion_index.push(parseInt(i));
				}
			}
			if (valid_suggestion_index.length === 0) {
				Output.w(`未筛选到可选的建议，故跳过此条命令`);
			} else {
				let max_index_string_length = `${valid_suggestion_index[valid_suggestion_index.length - 1]}`.length;
				let i = Input.number([`请输入建议序号，输入空串则跳过此条命令`, [
					...valid_suggestion_index.map((e) => (`${make_prefix_padded_string(e + 1, ' ', max_index_string_length)}. ${suggestion[e].description}`))
				]], Check.enum_checkerx(valid_suggestion_index.map((e) => (e + 1))), true);
				if (i !== null) {
					selected_suggestion = suggestion[i - 1];
				}
			}
		}
		if (selected_suggestion !== undefined) {
			try {
				selected_suggestion.worker(command.input, command.option);
			} catch (e: any) {
				Output.e(`${e}`);
			}
		}
		return;
	}

	// ------------------------------------------------

}