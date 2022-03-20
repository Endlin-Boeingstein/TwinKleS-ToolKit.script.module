/**
 * 注入全局执行器建议
 * + fs.package.rsb.smf.compress RSB.SMF压缩
 * + fs.package.rsb.smf.uncompress RSB.SMF解压
 * + fs.package.rsb.smf.compress.batch [批处理]RSB.SMF压缩
 * + fs.package.rsb.smf.uncompress.batch [批处理]RSB.SMF解压
 */
namespace TwinKleS.Entry.suggestion.fs.package_.rsb.smf {

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.package.rsb.smf.compress',
				description: 'RSB.SMF压缩',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rsb\.smf)$/i.test(input);
				},
				worker(input, option) {
					let raw_file = input;
					let ripe_file = input_available_path_if_need(raw_file, raw_file.replace(/(\.rsb\.smf)$/i, '.ripe.rsb.smf'), '输出路径');
					CoreX.Tool.Expand.PvZ2CHSRSBSMFCompress.compress_fs(raw_file, ripe_file);
					Output.i(`输出路径：${ripe_file}`);
				},
			},
			{
				id: 'fs.package.rsb.smf.uncompress',
				description: 'RSB.SMF解压',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rsb\.smf)$/i.test(input);
				},
				worker(input, option) {
					let ripe_file = input;
					let raw_file = input_available_path_if_need(ripe_file, ripe_file.replace(/(\.rsb\.smf)$/i, '.raw.rsb.smf'), '输出路径');
					CoreX.Tool.Expand.PvZ2CHSRSBSMFCompress.uncompress_fs(ripe_file, raw_file);
					Output.i(`输出路径：${raw_file}`);
				},
			},
		);
		g_executor_suggestion_of_batch.push(
			{
				id: 'fs.package.rsb.smf.compress.batch',
				description: '[批处理]RSB.SMF压缩',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.rsb\.smf)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rsb_smf_compress'), '输出路径');
					{
						for (let item of item_list) {
							let raw_file = `${source_directory}/${item}`;
							let ripe_file = `${dest_directory}/${item}`;
							try {
								CoreX.Tool.Expand.PvZ2CHSRSBSMFCompress.compress_fs(raw_file, ripe_file);
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
			{
				id: 'fs.package.rsb.smf.uncompress.batch',
				description: '[批处理]RSB.SMF解压',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.rsb\.smf)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rsb_smf_uncompress'), '输出路径');
					{
						for (let item of item_list) {
							let ripe_file = `${source_directory}/${item}`;
							let raw_file = `${dest_directory}/${item}`;
							try {
								CoreX.Tool.Expand.PvZ2CHSRSBSMFCompress.uncompress_fs(ripe_file, raw_file);
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
	injector: TwinKleS.Entry.suggestion.fs.package_.rsb.smf._injector,
});