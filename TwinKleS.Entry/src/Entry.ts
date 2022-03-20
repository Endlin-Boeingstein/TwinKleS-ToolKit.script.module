/** 以命令处理器为核心的模块入口实现 */
namespace TwinKleS.Entry {

	// ------------------------------------------------

	/**
	 * 如有必要，请求输入一个可用（不存在的）路径
	 * @param origin_path 源路径
	 * @param default_format 默认生成的路径格式
	 * @param path_message 路径信息
	 * @returns 可用的路径
	 */
	export function input_available_path_if_need(
		origin_path: string,
		default_format: string,
		path_message: string,
	): string {
		let format_argument = (() => {
			let path = PathUtility.to_regular(origin_path);
			let path_pair = PathUtility.split_pair(path);
			let name_pair = PathUtility.split_extension(path);
			return {
				w: path,
				p: path_pair[0] || '',
				n: path_pair[1],
				nn: name_pair[0],
				ne: name_pair[1] || '',
			};
		})();
		let make_path = (format: string) => (
			format
				.replaceAll('<w>', format_argument.w)
				.replaceAll('<p>', format_argument.p)
				.replaceAll('<n>', format_argument.n)
				.replaceAll('<nn>', format_argument.nn)
				.replaceAll('<ne>', format_argument.ne)
		);
		let path = make_path(default_format);
		if (CoreX.FileSystem.exist(path)) {
			let option = Input.number([
				`自动生成的<${path_message}>已存在，请选择下一步行为`, [
					`1. 强制使用该路径，该路径原有内容（若为目录）可能残留`,
					`2. 删除已存在的文件或目录，并使用该路径`,
					`3. 输入一个新路径`,
					`自动生成路径：${path}`,
					`当前工作目录：${CoreX.FileSystem.current_directory()}`,
				]
			], Check.enum_checkerx([1, 2, 3]))! as 1 | 2 | 3;
			switch (option) {
				case 1: {
					break;
				}
				case 2: {
					CoreX.FileSystem.remove(path);
					Output.v(`删除完毕`);
					break;
				}
				case 3: {
					let format = Input.string([
						`请输入新路径`, [
							`格式符 <w>  ：源路径`,
							`格式符 <p>  ：源路径的父目录`,
							`格式符 <n>  ：源路径的名称`,
							`格式符 <nn> ：源路径的名称（除去后缀名）`,
							`格式符 <ne> ：源路径的名称的后缀名，若无后缀则为空串`,
						]
					], (value) => (!CoreX.FileSystem.exist(make_path(value)) ? null : `新生成的路径仍已存在：${make_path(value)}`))!;
					path = make_path(format);
					break;
				}
			}
		}
		return path;
	}

	// ------------------------------------------------

	/** 全局执行器建议 */
	export const g_executor_suggestion: Executor.Suggestion[] = [];

	/** 全局执行器建议（批处理类型） */
	export const g_executor_suggestion_of_batch: Executor.Suggestion[] = [];

	// ------------------------------------------------

	type Config = {
		byte_stream_use_big_endian: boolean;
		json_write: {
			buffer_size: string;
			format: {
				disable_trailing_comma: boolean;
				disable_array_wrap_line: boolean;
			};
		};
		pause_when_finish: boolean;
	};

	export function _injector(
		config: Config,
	) {
		// enable virtual-terminal-processing
		{
			let output_mode = CoreX.Process.Windows.get_standard_console_mode('output');
			if ((output_mode & CoreX.Process.Windows.OutputConsoleMode.ENABLE_VIRTUAL_TERMINAL_PROCESSING) !== 0) {
				Output.g_enabled_virtual_terminal_sequences = true;
			} else {
				try {
					CoreX.Process.Windows.set_standard_console_mode('output', output_mode | CoreX.Process.Windows.OutputConsoleMode.ENABLE_VIRTUAL_TERMINAL_PROCESSING);
					Output.g_enabled_virtual_terminal_sequences = true;
				} catch (e) {
					Output.g_enabled_virtual_terminal_sequences = false;
					Output.w(`can not enable virtual terminal processing`);
				}
			}
		}
		// set byte stream endian
		TwinKleS.Core.g_byte_stream_use_big_endian.value = config.byte_stream_use_big_endian;
		// set json write option
		{
			CoreX.JSON.set_write_buffer_size(
				parse_size_string(config.json_write.buffer_size),
			);
			CoreX.JSON.set_write_format(
				config.json_write.format.disable_trailing_comma,
				config.json_write.format.disable_array_wrap_line,
			);
		}
	}

	export function _entry(
		config: Config,
		argument: string[],
	) {
		Output.v(`TwinKleS-ToolKit script ${k_version}-${k_version_name}`);
		let timer = new Timer();
		timer.start();
		let raw_command = [...argument];
		if (raw_command.length === 0) {
			Output.i(`请依次输入命令参数，输入空串以结束输入`);
			while (true) {
				let input = Input.string(null, null, true);
				if (input === null) {
					break;
				}
				raw_command.push(input);
			}
		}
		let command = Executor.parse(raw_command);
		let suggestion = [...g_executor_suggestion, ...g_executor_suggestion_of_batch];
		Output.i(`解析得 ${command.length} 条命令`);
		let progress_text = new TextGenerator.Progress('fraction', command.length, command.length);
		for (let e of command) {
			progress_text.increase();
			Output.i(`执行命令 ${progress_text} <${e.input}>${e.suggestion === null ? '' : ` -suggestion <${e.suggestion}>`}`);
			Executor.execute(e, suggestion);
		}
		timer.stop();
		Output.i(`完毕：${timer.duration()}ms`);
		if (config.pause_when_finish) {
			Input.pause();
		}
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry._injector,
	entry: TwinKleS.Entry._entry,
});