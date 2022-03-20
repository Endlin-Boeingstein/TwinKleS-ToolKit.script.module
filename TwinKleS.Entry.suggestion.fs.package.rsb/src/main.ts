/**
 * 注入全局执行器建议
 * + fs.package.rsb.pack RSB打包
 * + fs.package.rsb.unpack RSB解包
 */
namespace TwinKleS.Entry.suggestion.fs.package_.rsb {

	// ------------------------------------------------

	function make_rsb_package_relative_path(
		mode: 1 | 2 | 3,
	) {
		let result: {
			resource_directory: string;
			packet_file: string;
			packet_manifest_file: string;
		};
		switch (mode) {
			case 1: {
				result = {
					resource_directory: 'group/{0}/{1}/resource',
					packet_file: 'group/{0}/{1}/packet.rsgp',
					packet_manifest_file: 'group/{0}/{1}/manifest.json',
				};
				break;
			}
			case 2: {
				result = {
					resource_directory: 'subgroup/{1}/resource',
					packet_file: 'subgroup/{1}/packet.rsgp',
					packet_manifest_file: 'subgroup/{1}/manifest.json',
				};
				break;
			}
			case 3: {
				result = {
					resource_directory: 'resource',
					packet_file: 'packet/{1}.rsgp',
					packet_manifest_file: 'packet/{1}.json',
				};
				break;
			}
		}
		return result;
	}

	// ------------------------------------------------

	type Config = {
		pack_buffer_size: null | string;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.package.rsb.pack',
				description: 'RSB打包',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input) && /.+(\.(rsb|rsb\.smf|obb))(\.package)$/i.test(input);
				},
				worker(input, option) {
					let package_directory = input;
					let package_file = input_available_path_if_need(package_directory, package_directory.replace(/(\.package)$/i, ''), '输出路径');
					let mode = Input.number([
						`请选择数据导入模式`, [
							`1. 群组：按群+子群树形结构导入，资源与子包均导入自group/<群名>/<子群名>目录`,
							`2. 子群：按子群树形结构导入，资源与子包均导入自subgroup/<子群名>目录`,
							`3. 资源：所有资源导入自resource目录，所有子包导入自packet目录`,
						]
					], Check.enum_checkerx([1, 2, 3]))! as 1 | 2 | 3;
					let relative_path = make_rsb_package_relative_path(mode);
					let manifest_file = `${package_directory}/manifest.json`;
					let resource_manifest_file = `${package_directory}/resource_manifest.json`;
					let resource_directory = `${package_directory}/${relative_path.resource_directory}`;
					let input_resource = Input.yon(`是否使用已有子包`)!;
					let packet_file = !input_resource ? null : `${package_directory}/${relative_path.packet_file}`;
					let output_new_packet = Input.yon(`是否导出新打包的子包（导出至对应模式下的子包文件路径，会覆盖原有子包文件）`)!;
					let new_packet_file = !output_new_packet ? null : `${package_directory}/${relative_path.packet_file}`;
					let package_data_buffer_size: bigint;
					if (config.pack_buffer_size !== null) {
						Output.v(`预设：用于存储包数据输出的内存空间容量：${config.pack_buffer_size}`);
						package_data_buffer_size = parse_size_string(config.pack_buffer_size);
					} else {
						package_data_buffer_size = Input.size(`请输入用于存储包数据输出的内存空间容量`)!;
					}
					CoreX.Tool.Package.RSB.pack_fs(package_file, manifest_file, resource_manifest_file, resource_directory, packet_file, new_packet_file, package_data_buffer_size);
					Output.i(`输出路径：${package_file}`);
				},
			},
			{
				id: 'fs.package.rsb.unpack',
				description: 'RSB解包',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.(rsb|rsb\.smf|obb))$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let package_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.package'), '输出路径');
					let mode = Input.number([
						`请选择数据导出模式`, [
							`1. 群组：按群+子群树形结构导出，资源与子包均导出至group/<群名>/<子群名>目录`,
							`2. 子群：按子群树形结构导出，资源与子包均导出至subgroup/<子群名>目录`,
							`3. 资源：所有资源导出至resource目录，所有子包导出至packet目录`,
						]
					], Check.enum_checkerx([1, 2, 3]))! as 1 | 2 | 3;
					let relative_path = make_rsb_package_relative_path(mode);
					let manifest_file = `${package_directory}/manifest.json`;
					let resource_manifest_file = `${package_directory}/resource_manifest.json`;
					let output_resource = Input.yon(`是否导出资源`)!;
					let resource_directory = !output_resource ? null : `${package_directory}/${relative_path.resource_directory}`;
					let output_packet = Input.yon(`是否导出子包`)!;
					let packet_file = !output_packet ? null : `${package_directory}/${relative_path.packet_file}`;
					CoreX.Tool.Package.RSB.unpack_fs(package_file, manifest_file, resource_manifest_file, resource_directory, packet_file);
					Output.i(`输出路径：${package_directory}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.package_.rsb._injector,
});