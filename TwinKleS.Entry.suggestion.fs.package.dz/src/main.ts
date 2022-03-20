/**
 * 注入全局执行器建议
 * + fs.package.dz.pack DZ打包
 * + fs.package.dz.unpack DZ解包
 * + fs.package.dz.unpack_resource DZ资源解包
 * + fs.package.dz.pack_resource DZ资源打包
 */
namespace TwinKleS.Entry.suggestion.fs.package_.dz {

	// ------------------------------------------------

	type Config = {
		pack_buffer_size: null | string;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.package.dz.pack',
				description: 'DZ打包',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input) && /.+(\.dz)(\.package)$/i.test(input);
				},
				worker(input, option) {
					let package_directory = input;
					let package_file = input_available_path_if_need(package_directory, package_directory.replace(/(\.package)$/i, ''), '输出路径');
					let manifest_file = `${package_directory}/manifest.json`;
					let resource_directory = `${package_directory}/resource`;
					let package_data_buffer_size: bigint;
					if (config.pack_buffer_size !== null) {
						Output.v(`预设：请输入用于存储包数据输出的内存空间容量：${config.pack_buffer_size}`);
						package_data_buffer_size = parse_size_string(config.pack_buffer_size);
					} else {
						package_data_buffer_size = Input.size(`请输入用于存储包数据输出的内存空间容量`)!;
					}
					CoreX.Tool.Package.DZ.pack_fs(package_file, manifest_file, resource_directory, package_data_buffer_size);
					Output.i(`输出路径：${package_file}`);
				},
			},
			{
				id: 'fs.package.dz.unpack',
				description: 'DZ解包',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.dz)$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let package_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.package'), '输出路径');
					let manifest_file = `${package_directory}/manifest.json`;
					let resource_directory = `${package_directory}/resource`;
					CoreX.Tool.Package.DZ.unpack_fs(package_file, manifest_file, resource_directory);
					Output.i(`输出路径：${package_directory}`);
				},
			},
			{
				id: 'fs.package.dz.unpack_resource',
				description: 'DZ资源解包',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.dz)$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let resource_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.resource'), '输出路径');
					CoreX.Tool.Package.DZ.unpack_fs(package_file, null, resource_directory);
					Output.i(`输出路径：${resource_directory}`);
				},
			},
			{
				id: 'fs.package.dz.pack_resource',
				description: 'DZ资源打包',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input) && /.+(\.dz)(\.resource)$/i.test(input);
				},
				worker(input, option) {
					let resource_directory = input;
					let package_file = input_available_path_if_need(resource_directory, resource_directory.replace(/(\.resource)$/i, ''), '输出路径');
					let package_data = Support.DZResourcePacker.pack(resource_directory, 'regular');
					CoreX.FileSystem.write_file(package_file, package_data[0].view().sub_view(Core.Size.value(0n), package_data[1]));
					Output.i(`输出路径：${package_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.package_.dz._injector,
});