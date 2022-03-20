/**
 * 注入全局执行器建议
 * + fs.json.format JSON格式化
 * + fs.json.format.batch [批处理]JSON格式化
 */
namespace TwinKleS.Entry.suggestion.fs.json {

	// ------------------------------------------------

	type Config = {
		disable_trailing_comma: null | boolean | 'default';
		disable_array_wrap_line: null | boolean | 'default';
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.json.format',
				description: 'JSON格式化',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.json)$/i.test(input);
				},
				worker(input, option) {
					let source_file = input;
					let dest_file = input_available_path_if_need(source_file, source_file.replace(/(\.json)$/i, '.formatted.json'), '输出路径');
					let disable_trailing_comma: boolean | undefined;
					if (config.disable_trailing_comma !== null) {
						Output.v(`预设：禁用尾随逗号：${config.disable_trailing_comma}`);
						disable_trailing_comma = config.disable_trailing_comma === 'default' ? undefined : config.disable_trailing_comma;
					} else {
						disable_trailing_comma = Input.yon(`是否禁用尾随逗号`)!;
					}
					let disable_array_wrap_line: boolean | undefined;
					if (config.disable_array_wrap_line !== null) {
						Output.v(`预设：禁用数组元素换行：${config.disable_array_wrap_line}`);
						disable_array_wrap_line = config.disable_array_wrap_line === 'default' ? undefined : config.disable_array_wrap_line;
					} else {
						disable_array_wrap_line = Input.yon(`是否禁用数组元素换行`)!;
					}
					let json = CoreX.JSON.read_fs(source_file);
					CoreX.JSON.write_fs(dest_file, json, disable_trailing_comma, disable_array_wrap_line);
					Output.i(`输出路径：${dest_file}`);
				},
			},
		);
		g_executor_suggestion_of_batch.push(
			{
				id: 'fs.json.format.batch',
				description: '[批处理]JSON格式化',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.json)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.json_format'), '输出路径');
					{
						let disable_trailing_comma: boolean | undefined;
						if (config.disable_trailing_comma !== null) {
							Output.v(`预设：禁用尾随逗号：${config.disable_trailing_comma}`);
							disable_trailing_comma = config.disable_trailing_comma === 'default' ? undefined : config.disable_trailing_comma;
						} else {
							disable_trailing_comma = Input.yon(`是否禁用尾随逗号`)!;
						}
						let disable_array_wrap_line: boolean | undefined;
						if (config.disable_array_wrap_line !== null) {
							Output.v(`预设：禁用数组元素换行：${config.disable_array_wrap_line}`);
							disable_array_wrap_line = config.disable_array_wrap_line === 'default' ? undefined : config.disable_array_wrap_line;
						} else {
							disable_array_wrap_line = Input.yon(`是否禁用数组元素换行`)!;
						}
						for (let item of item_list) {
							let source_file = `${source_directory}/${item}`;
							let dest_file = `${dest_directory}/${item}`;
							try {
								let json = CoreX.JSON.read_fs(source_file);
								CoreX.JSON.write_fs(dest_file, json, disable_trailing_comma, disable_array_wrap_line);
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.json._injector,
});