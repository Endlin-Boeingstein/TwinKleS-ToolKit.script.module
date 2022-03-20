/**
 * 注入全局执行器建议
 * + fs.expand.pvz2.lawn_string_text.convert PvZ2 字符串表版本转换
 */
namespace TwinKleS.Entry.suggestion.fs.expand.pvz2.lawn_string_text {

	// ------------------------------------------------

	function input_text_version(
		message: string,
	): Support.PvZ2LawnStringText.Version {
		let format_list = [...Object.keys(Support.PvZ2LawnStringText.Version)];
		let index = Input.number([
			message,
			format_list.map((e, i) => (`${make_prefix_padded_string(i + 1, ' ', 2)}. ${e}`)),
		], Check.enum_checkerx(format_list.map((e, i) => (i + 1))))!;
		return format_list[index - 1] as Support.PvZ2LawnStringText.Version;
	}

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.expand.pvz2.lawn_string_text.convert',
				description: 'PvZ2 字符串表版本转换',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.*(LawnString).*(\.(txt|json))$/i.test(input);
				},
				worker(input, option) {
					let source_file = input;
					let dest_version = input_text_version(`请输入目标文本版本`);
					let dest_file = input_available_path_if_need(source_file, source_file.replace(/(\.(txt|json))$/i, dest_version == Support.PvZ2LawnStringText.Version.text ? '.new.txt' : '.new.json'), '输出路径');
					Support.PvZ2LawnStringText.convert_fs(source_file, dest_file, 'auto', dest_version);
					Output.i(`输出路径：${dest_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.expand.pvz2.lawn_string_text._injector,
});