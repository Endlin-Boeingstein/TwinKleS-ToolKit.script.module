/**
 * 注入全局执行器建议
 * + fs.data.zlib.compress ZLib压缩
 * + fs.data.zlib.uncompress ZLib解压
 */
namespace TwinKleS.Entry.suggestion.fs.data.zlib {

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.data.zlib.compress',
				description: 'ZLib压缩',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input);
				},
				worker(input, option) {
					let raw_file = input;
					let ripe_file = input_available_path_if_need(raw_file, raw_file.replace(/$/i, '.zlib_compress.bin'), '输出路径');
					CoreX.Tool.Data.Compress.ZLib.compress_fs(raw_file, ripe_file);
					Output.i(`输出路径：${ripe_file}`);
				},
			},
			{
				id: 'fs.data.zlib.uncompress',
				description: 'ZLib解压',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input);
				},
				worker(input, option) {
					let ripe_file = input;
					let raw_file = input_available_path_if_need(ripe_file, ripe_file.replace(/$/i, '.zlib_uncompress.bin'), '输出路径');
					let raw_data_buffer_size = Input.size(`请输入用于保存原始数据的内存空间大小`)!;
					CoreX.Tool.Data.Compress.ZLib.uncompress_fs(ripe_file, raw_file, raw_data_buffer_size);
					Output.i(`输出路径：${raw_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.data.zlib._injector,
});