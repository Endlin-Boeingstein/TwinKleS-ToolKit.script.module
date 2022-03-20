/**
 * 注入全局执行器建议
 * + fs.js.evaluate JS执行
 * + fs.js.compile JS编译
 */
namespace TwinKleS.Entry.suggestion.fs.js {

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.js.evaluate',
				description: 'JS执行',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.js)$/i.test(input);
				},
				worker(input, option) {
					let script_file = input;
					CoreX._JS.evaluate_fs(script_file);
					Output.i(`运行完毕`);
				},
			},
			{
				id: 'fs.js.compile',
				description: 'JS编译',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.js)$/i.test(input);
				},
				worker(input, option) {
					let script_file = input;
					let byte_code_file = input_available_path_if_need(script_file, script_file.replace(/$/i, '.bin'), '输出路径');
					CoreX._JS.compile_fs(script_file, byte_code_file);
					Output.i(`输出路径：${byte_code_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.js._injector,
});