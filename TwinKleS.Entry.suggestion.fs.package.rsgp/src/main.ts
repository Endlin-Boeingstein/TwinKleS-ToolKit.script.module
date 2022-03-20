/**
 * 注入全局执行器建议
 * + fs.package.rsgp.pack RSGP打包
 * + fs.package.rsgp.unpack RSGP解包
 * + fs.package.rsgp.unpack_resource RSGP资源解包
 */
namespace TwinKleS.Entry.suggestion.fs.package_.rsgp {

	// ------------------------------------------------

	type Config = {
		pack_buffer_size: null | string;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.package.rsgp.pack',
				description: 'RSGP打包',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input) && /.+(\.rsgp)(\.package)$/i.test(input);
				},
				worker(input, option) {
					let package_directory = input;
					let package_file = input_available_path_if_need(package_directory, package_directory.replace(/(\.package)$/i, ''), '输出路径');
					let manifest_file = `${package_directory}/manifest.json`;
					let resource_directory = `${package_directory}/resource`;
					let package_data_buffer_size: bigint;
					if (config.pack_buffer_size !== null) {
						Output.v(`预设：用于存储包数据输出的内存空间容量：${config.pack_buffer_size}`);
						package_data_buffer_size = parse_size_string(config.pack_buffer_size);
					} else {
						package_data_buffer_size = Input.size(`请输入用于存储包数据输出的内存空间容量`)!;
					}
					CoreX.Tool.Package.RSGP.pack_fs(package_file, manifest_file, resource_directory, package_data_buffer_size);
					Output.i(`输出路径：${package_file}`);
				},
			},
			{
				id: 'fs.package.rsgp.unpack',
				description: 'RSGP解包',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rsgp)$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let package_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.package'), '输出路径');
					let manifest_file = `${package_directory}/manifest.json`;
					let resource_directory = `${package_directory}/resource`;
					CoreX.Tool.Package.RSGP.unpack_fs(package_file, manifest_file, resource_directory);
					Output.i(`输出路径：${package_directory}`);
				},
			},
			{
				id: 'fs.package.rsgp.unpack_resource',
				description: 'RSGP资源解包',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rsgp)$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let resource_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.resource'), '输出路径');
					CoreX.Tool.Package.RSGP.unpack_fs(package_file, null, resource_directory);
					Output.i(`输出路径：${resource_directory}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.package_.rsgp._injector,
});