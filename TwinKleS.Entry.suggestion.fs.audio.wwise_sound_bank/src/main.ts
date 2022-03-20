/**
 * 注入全局执行器建议
 * + fs.audio.wwise_sound_bank.pack Wwise-BNK打包
 * + fs.audio.wwise_sound_bank.unpack Wwise-BNK解包
 */
namespace TwinKleS.Entry.suggestion.fs.audio.wwise_sound_bank {

	// ------------------------------------------------

	type Config = {
		pack_buffer_size: null | string;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.audio.wwise_sound_bank.pack',
				description: 'Wwise-BNK打包',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input) && /.+(\.bnk)(\.package)$/i.test(input);
				},
				worker(input, option) {
					let package_directory = input;
					let package_file = input_available_path_if_need(package_directory, package_directory.replace(/(\.package)$/i, ''), '输出路径');
					let manifest_file = `${package_directory}/manifest.json`;
					let extra_directory = `${package_directory}`;
					let package_data_buffer_size: bigint;
					if (config.pack_buffer_size !== null) {
						Output.v(`预设：请输入用于存储包数据输出的内存空间容量：${config.pack_buffer_size}`);
						package_data_buffer_size = parse_size_string(config.pack_buffer_size);
					} else {
						package_data_buffer_size = Input.size(`请输入用于存储包数据输出的内存空间容量`)!;
					}
					CoreX.Tool.Audio.WwiseSoundBank.pack_fs(package_file, manifest_file, extra_directory, package_data_buffer_size);
					Output.i(`输出路径：${package_file}`);
				},
			},
			{
				id: 'fs.audio.wwise_sound_bank.unpack',
				description: 'Wwise-BNK解包',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.bnk)$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let package_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.package'), '输出路径');
					let manifest_file = `${package_directory}/manifest.json`;
					let extra_directory = `${package_directory}`;
					CoreX.Tool.Audio.WwiseSoundBank.unpack_fs(package_file, manifest_file, extra_directory);
					Output.i(`输出路径：${package_directory}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.audio.wwise_sound_bank._injector,
});