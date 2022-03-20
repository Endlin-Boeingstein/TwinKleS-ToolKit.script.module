/**
 * 注入全局执行器建议
 * + fs.package.rsb.extract_resource RSB资源提取
 */
namespace TwinKleS.Entry.suggestion.fs.package_.rsb.extract_resource {

	// ------------------------------------------------

	type Config = {
		need_extract_json: null | boolean;
		need_extract_json_crypt_key: null | boolean;
		need_extract_image: null | boolean;
		need_extract_image_resize: null | boolean;
		need_extract_image_split: null | boolean;
		need_extract_animation: null | boolean;
		need_extract_animation_raw: null | boolean;
		need_extract_animation_flash: null | boolean;
		need_extract_animation_computed: null | boolean;
		need_extract_audio: null | boolean;
		extract_json_crypt_key: null | string;
		extract_image_texture_format_map_list: Record<string, Support.PvZ2RSB.ResourceExtract.TextureFormatMap>;
		extract_image_texture_format_map_name: null | 'auto';
		extract_animation_flash_image_resolution: null | bigint;
		extract_audio_tool: {
			ffmpeg: string;
			ww2ogg: string;
			ww2ogg_pcb: string;
		};
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.package.rsb.extract_resource',
				description: 'RSB资源提取',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.(rsb|rsb\.smf|obb))$/i.test(input);
				},
				worker(input, option) {
					let package_file = input;
					let package_directory = input_available_path_if_need(package_file, package_file.replace(/$/i, '.extract'), '输出路径');
					let need_extract_json: boolean;
					if (config.need_extract_json !== null) {
						Output.v(`预设：提取JSON：${config.need_extract_json}`);
						need_extract_json = config.need_extract_json;
					} else {
						need_extract_json = Input.yon(`是否提取JSON`)!;
					}
					let need_extract_json_crypt_key: boolean;
					if (!need_extract_json) {
						need_extract_json_crypt_key = false;
					} else if (config.need_extract_json_crypt_key !== null) {
						Output.v(`预设：RTON已被加密：${config.need_extract_json_crypt_key}`);
						need_extract_json_crypt_key = config.need_extract_json_crypt_key;
					} else {
						need_extract_json_crypt_key = Input.yon(`RTON是否已被加密`)!;
					}
					let extract_json_crypt_key: null | string;
					if (!need_extract_json_crypt_key) {
						extract_json_crypt_key = null;
					} else if (config.extract_json_crypt_key !== null) {
						Output.v(`预设：RTON密钥：<hidden>`);
						extract_json_crypt_key = config.extract_json_crypt_key;
					} else {
						extract_json_crypt_key = Input.string(`请输入RTON密钥`)!;
					}
					let need_extract_image: boolean;
					if (config.need_extract_image !== null) {
						Output.v(`预设：提取图像：${config.need_extract_image}`);
						need_extract_image = config.need_extract_image;
					} else {
						need_extract_image = Input.yon(`是否提取图像`)!;
					}
					let extract_image_texture_format_map: null | Support.PvZ2RSB.ResourceExtract.TextureFormatMap;
					if (!need_extract_image) {
						extract_image_texture_format_map = null;
					} else {
						let map_name_list = Object.keys(config.extract_image_texture_format_map_list);
						if (map_name_list.length === 0) {
							throw new MyError(`无纹理格式索引表可选`);
						}
						if (config.extract_image_texture_format_map_name === null) {
							let map_name_index = Input.number([
								`请选择需要应用的纹理格式`, map_name_list.map((e, i) => (`${i + 1}. ${e}`))
							], Check.enum_checkerx(map_name_list.map((e, i) => (i + 1))))!;
							extract_image_texture_format_map = config.extract_image_texture_format_map_list[map_name_list[map_name_index - 1]];
						} else if (config.extract_image_texture_format_map_name === 'auto') {
							Output.v(`预设：纹理格式索引表：<auto>`);
							let map_name = '';
							if (/.+(\.rsb)$/i.test(package_file)) {
								map_name = 'pvz2_ios';
							} else if (/.+(\.obb)$/i.test(package_file)) {
								map_name = 'pvz2_android';
							} else if (/.+(\.rsb\.smf)$/i.test(package_file)) {
								map_name = 'pvz2_chs_android';
							}
							if (config.extract_image_texture_format_map_list[map_name] === undefined) {
								throw new MyError(`不存在所需的纹理格式索引表：${map_name}`);
							}
							extract_image_texture_format_map = config.extract_image_texture_format_map_list[map_name];
						}
					}
					let need_extract_image_resize: boolean;
					if (!need_extract_image) {
						need_extract_image_resize = false;
					} else if (config.need_extract_image_resize !== null) {
						Output.v(`预设：调整Atlas尺寸：${config.need_extract_image_resize}`);
						need_extract_image_resize = config.need_extract_image_resize;
					} else {
						need_extract_image_resize = Input.yon(`是否调整Atlas尺寸（以资源清单内的定义为准）`)!;
					}
					let need_extract_image_split: boolean;
					if (!need_extract_image) {
						need_extract_image_split = false;
					} else if (config.need_extract_image_split !== null) {
						Output.v(`预设：分解Atlas：${config.need_extract_image_split}`);
						need_extract_image_split = config.need_extract_image_split;
					} else {
						need_extract_image_split = Input.yon(`是否分解Atlas`)!;
					}
					let need_extract_animation: boolean;
					if (config.need_extract_animation !== null) {
						Output.v(`预设：提取动画：${config.need_extract_animation}`);
						need_extract_animation = config.need_extract_animation;
					} else {
						need_extract_animation = Input.yon(`是否提取动画`)!;
					}
					let need_extract_animation_raw: boolean;
					if (!need_extract_animation) {
						need_extract_animation_raw = false;
					} else if (config.need_extract_animation_raw !== null) {
						Output.v(`预设：提取动画为PAM-JSON：${config.need_extract_animation_raw}`);
						need_extract_animation_raw = config.need_extract_animation_raw;
					} else {
						need_extract_animation_raw = Input.yon(`是否提取动画为PAM-JSON`)!;
					}
					let need_extract_animation_flash: boolean;
					if (!need_extract_animation) {
						need_extract_animation_flash = false;
					} else if (config.need_extract_animation_flash !== null) {
						Output.v(`预设：提取动画为PAM-Flash格式：${config.need_extract_animation_flash}`);
						need_extract_animation_flash = config.need_extract_animation_flash;
					} else {
						need_extract_animation_flash = Input.yon(`是否提取动画为PAM-Flash格式`)!;
					}
					let extract_animation_flash_image_resolution: null | bigint;
					if (!need_extract_animation_flash) {
						extract_animation_flash_image_resolution = null;
					} else if (config.extract_animation_flash_image_resolution !== null) {
						Output.v(`预设：PAM-Flash图像分辨率：${config.extract_animation_flash_image_resolution}`);
						extract_animation_flash_image_resolution = config.extract_animation_flash_image_resolution;
					} else {
						extract_animation_flash_image_resolution = Input.integer(`请输入PAM-Flash图像分辨率`, (value) => (value > 0 ? null : `分辨率必须大于0`))!;
					}
					let need_extract_animation_computed: boolean;
					if (!need_extract_animation) {
						need_extract_animation_computed = false;
					} else if (config.need_extract_animation_computed !== null) {
						Output.v(`预设：提取动画为PAM-Computed-JSON：${config.need_extract_animation_computed}`);
						need_extract_animation_computed = config.need_extract_animation_computed;
					} else {
						need_extract_animation_computed = Input.yon(`是否提取动画为PAM-Computed-JSON`)!;
					}
					let need_extract_audio: boolean;
					if (config.need_extract_audio !== null) {
						Output.v(`预设：提取音频：${config.need_extract_audio}`);
						need_extract_audio = config.need_extract_audio;
					} else {
						need_extract_audio = Input.yon(`是否提取音频`)!;
					}
					Support.PvZ2RSB.ResourceExtract.extract_package(
						package_file,
						`${package_directory}/manifest.json`,
						`${package_directory}/resource_manifest.json`,
						`${package_directory}/resource`,
						!need_extract_json ? null : {
							directory: `${package_directory}/extract`,
							crypt_key: extract_json_crypt_key,
						},
						!need_extract_image ? null : {
							directory: `${package_directory}/extract`,
							texture_format_map: extract_image_texture_format_map!,
							resize: need_extract_image_resize,
							split: need_extract_image_split,
						},
						!need_extract_animation ? null : {
							directory: `${package_directory}/extract`,
							raw: need_extract_animation_raw,
							flash: !need_extract_animation_flash ? null : {
								image_resolution: extract_animation_flash_image_resolution!,
							},
							computed: need_extract_animation_computed,
						},
						!need_extract_audio ? null : {
							directory: `${package_directory}/extract`,
							tool: config.extract_audio_tool,
							temp_directory: `${package_directory}/audio_temp`,
						}
					);
					CoreX.FileSystem.remove(`${package_directory}/audio_temp`);
					Output.i(`输出路径：${package_directory}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.package_.rsb.extract_resource._injector,
});