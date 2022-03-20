/**
 * 注入全局执行器建议
 * + fs.audio.wwise_encoded_media.decode Wwise-WEM音频解码
 * + fs.audio.wwise_encoded_media.decode.batch [批处理]WEM音频解码
 */
namespace TwinKleS.Entry.suggestion.fs.audio.wwise_encoded_media {

	// ------------------------------------------------

	type Config = {
		tool: {
			ffmpeg: string;
			ww2ogg: string;
			ww2ogg_pcb: string;
		};
		temp_directpry: string;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.audio.wwise_encoded_media.decode',
				description: 'Wwise-WEM音频解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.wem)$/i.test(input);
				},
				worker(input, option) {
					let ripe_file = input;
					let raw_file = input_available_path_if_need(ripe_file, ripe_file.replace(/(\.wem)$/i, '.wav'), `[输出]WAV文件路径`);
					CoreX.Tool.Audio.WwiseEncodedMedia.decode_fs(ripe_file, raw_file, config.tool.ffmpeg, config.tool.ww2ogg, config.tool.ww2ogg_pcb, config.temp_directpry);
					Output.i(`输出路径：${raw_file}`);
				},
			},
		);
		g_executor_suggestion_of_batch.push(
			{
				id: 'fs.audio.wwise_encoded_media.decode.batch',
				description: '[批处理]WEM音频解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.wem)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.wem_decode'), '输出路径');
					{
						for (let item of item_list) {
							let ripe_file = `${source_directory}/${item}`;
							let raw_file = `${dest_directory}/${item.replace(/(\.wem)$/i, '.wav')}`;
							try {
								CoreX.Tool.Audio.WwiseEncodedMedia.decode_fs(ripe_file, raw_file, config.tool.ffmpeg, config.tool.ww2ogg, config.tool.ww2ogg_pcb, config.temp_directpry);
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
	injector: TwinKleS.Entry.suggestion.fs.audio.wwise_encoded_media._injector,
});