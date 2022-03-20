/**
 * 注入全局执行器建议
 * + fs.image.popcap_texture.encode PTX编码
 * + fs.image.popcap_texture.decode PTX解码
 */
namespace TwinKleS.Entry.suggestion.fs.image.popcap_texture {

	// ------------------------------------------------

	function input_popcap_texture_format(
		message: string,
	): Support.PopcapTexture.Format {
		let format_list = [...Object.keys(Support.PopcapTexture.BaseFormat), ...Object.keys(Support.PopcapTexture.SpecialFormat)];
		let index = Input.number([
			message,
			format_list.map((e, i) => (`${make_prefix_padded_string(i + 1, ' ', 2)}. ${e}`)),
		], Check.enum_checkerx(format_list.map((e, i) => (i + 1))))!;
		return format_list[index - 1] as Support.PopcapTexture.Format;
	}

	function input_image_size(
		message: string,
	): CoreX.Tool.Image.ImageSize {
		let width = Input.integer(message, (value) => (value > 0n ? null : `尺寸不可为0`))!;
		let height = Input.integer(null, (value) => (value > 0n ? null : `尺寸不可为0`))!;
		return [width, height];
	}

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.image.popcap_texture.encode',
				description: 'PTX编码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.png)$/i.test(input);
				},
				worker(input, option) {
					let image_file = input;
					let data_file = input_available_path_if_need(image_file, image_file.replace(/(\.png)$/i, '.ptx'), '输出路径');
					let format = input_popcap_texture_format(`请输入使用的纹理格式`);
					Support.PopcapTexture.encode_fs(image_file, data_file, format);
					Output.i(`输出路径：${data_file}`);
				},
			},
			{
				id: 'fs.image.popcap_texture.decode',
				description: 'PTX解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.ptx)$/i.test(input);
				},
				worker(input, option) {
					let data_file = input;
					let image_file = input_available_path_if_need(data_file, data_file.replace(/(\.ptx)$/i, '.png'), '输出路径');
					let image_size = input_image_size(`请输入图像宽、高`);
					let format = input_popcap_texture_format(`请输入使用的纹理格式`);
					Support.PopcapTexture.decode_fs(data_file, image_file, image_size, format);
					Output.i(`输出路径：${image_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.image.popcap_texture._injector,
});