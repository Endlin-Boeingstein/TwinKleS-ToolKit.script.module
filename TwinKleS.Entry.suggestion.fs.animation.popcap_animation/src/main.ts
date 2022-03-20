/**
 * 注入全局执行器建议
 * + fs.animation.popcap_animation.encode PAM编码
 * + fs.animation.popcap_animation.decode PAM解码
 * + fs.animation.popcap_animation.convert.flash.from PAM-JSON转换至Flash
 * + fs.animation.popcap_animation.convert.compute PAM-JSON样式运算
 */
namespace TwinKleS.Entry.suggestion.fs.animation.popcap_animation {

	// ------------------------------------------------

	type Config = {
		pack_buffer_size: null | string;
		image_resolution: null | bigint;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.animation.popcap_animation.encode',
				description: 'PAM编码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.pam)(\.json)$/i.test(input);
				},
				worker(input, option) {
					let information_file = input;
					let data_file = input_available_path_if_need(information_file, information_file.replace(/(\.json)$/i, ''), '输出路径');
					let data_buffer_size: bigint;
					if (config.pack_buffer_size !== null) {
						Output.v(`预设：用于存储PAM数据输出的内存空间容量：${config.pack_buffer_size}`);
						data_buffer_size = parse_size_string(config.pack_buffer_size);
					} else {
						data_buffer_size = Input.size(`请输入用于存储PAM数据输出的内存空间容量`)!;
					}
					CoreX.Tool.Animation.PopcapAnimation.encode_fs(data_file, information_file, data_buffer_size);
					Output.i(`输出路径：${data_file}`);
				},
			},
			{
				id: 'fs.animation.popcap_animation.decode',
				description: 'PAM解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.pam)$/i.test(input);
				},
				worker(input, option) {
					let data_file = input;
					let information_file = input_available_path_if_need(data_file, data_file.replace(/$/i, '.json'), '输出路径');
					CoreX.Tool.Animation.PopcapAnimation.decode_fs(data_file, information_file);
					Output.i(`输出路径：${information_file}`);
				},
			},
			{
				id: 'fs.animation.popcap_animation.convert.flash.from',
				description: 'PAM-JSON转换至Flash',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.pam)(\.json)$/i.test(input);
				},
				worker(input, option) {
					let raw_file = input;
					let ripe_directory = input_available_path_if_need(raw_file, raw_file.replace(/(\.json)$/i, '.xfl'), '输出路径');
					let image_resolution: bigint;
					if (config.image_resolution !== null) {
						Output.v(`预设：图像分辨率：${config.image_resolution}`);
						image_resolution = config.image_resolution;
					} else {
						image_resolution = Input.integer(`请输入图像分辨率`, (value) => (value > 0 ? null : `分辨率必须大于0`))!;
					}
					Support.PopcapAnimation.Convert.Flash.From.from_fs(raw_file, ripe_directory, image_resolution);
					Output.i(`输出路径：${ripe_directory}`);
				},
			},
			{
				id: 'fs.animation.popcap_animation.convert.compute',
				description: 'PAM-JSON样式运算',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.pam)(\.json)$/i.test(input);
				},
				worker(input, option) {
					let raw_file = input;
					let ripe_file = input_available_path_if_need(raw_file, raw_file.replace(/(\.json)$/i, '.computed.json'), '输出路径');
					Support.PopcapAnimation.Convert.Compute.compute_fs(raw_file, ripe_file);
					Output.i(`输出路径：${ripe_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.animation.popcap_animation._injector,
});