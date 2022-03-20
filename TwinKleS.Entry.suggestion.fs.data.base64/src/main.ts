/**
 * 注入全局执行器建议
 * + fs.data.base64.encode Base64编码
 * + fs.data.base64.decode Base64解码
 */
namespace TwinKleS.Entry.suggestion.fs.data.base64 {

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.data.base64.encode',
				description: 'Base64编码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input);
				},
				worker(input, option) {
					let raw_file = input;
					let ripe_file = input_available_path_if_need(raw_file, raw_file.replace(/$/i, '.base64_encode.txt'), '输出路径');
					CoreX.Tool.Data.Encode.Base64.encode_fs(raw_file, ripe_file);
					Output.i(`输出路径：${ripe_file}`);
				},
			},
			{
				id: 'fs.data.base64.decode',
				description: 'Base64解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input);
				},
				worker(input, option) {
					let ripe_file = input;
					let raw_file = input_available_path_if_need(ripe_file, ripe_file.replace(/$/i, '.base64_decode.bin'), '输出路径');
					CoreX.Tool.Data.Encode.Base64.decode_fs(ripe_file, raw_file);
					Output.i(`输出路径：${raw_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.data.base64._injector,
});