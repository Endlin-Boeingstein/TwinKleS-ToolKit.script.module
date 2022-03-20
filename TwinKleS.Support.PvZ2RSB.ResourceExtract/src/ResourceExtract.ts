/** PvZ2-RSB资源提取 */
namespace TwinKleS.Support.PvZ2RSB.ResourceExtract {

	/** 纹理索引表 */
	export type TextureFormatMap = {
		index: bigint;
		format: Support.PopcapTexture.Format;
	}[];

	/**
	 * 从资源目录中提取资源
	 * @param package_manifest 包清单
	 * @param resource_manifest 资源清单
	 * @param resource_directory 资源目录路径
	 * @param extract_json 提取JSON选项
	 * @param extract_image 提取图像选项
	 * @param extract_animation 提取动画选项
	 * @param extract_audio 提取音频选项
	 */
	export function extract(
		package_manifest: Core.Tool.Package.RSB.Information.JS_N.Package,
		resource_manifest: Manifest.Package,
		resource_directory: string,
		extract_json: null | {
			directory: string;
			crypt_key: null | string;
		},
		extract_image: null | {
			directory: string;
			texture_format_map: TextureFormatMap;
			resize: boolean;
			split: boolean;
		},
		extract_animation: null | {
			directory: string;
			raw: boolean;
			flash: null | {
				image_resolution: bigint;
			};
			computed: boolean;
		},
		extract_audio: null | {
			directory: string;
			tool: {
				ffmpeg: string;
				ww2ogg: string;
				ww2ogg_pcb: string;
			};
			temp_directory: string;
		},
	): void {
		let iterate_manifest = (show_group_progress: boolean) => (work: (
			group: [string, Manifest.Group, Core.Tool.Package.RSB.Information.JS_N.Group],
			subgroup: [string, Manifest.Subgroup, Core.Tool.Package.RSB.Information.JS_N.Subgroup],
			resource: [string, Manifest.Resource, Core.Tool.Package.RSB.Information.JS_N.Resource],
		) => void): void => {
			let group_progress_text = new TextGenerator.Progress('fraction', 25, Object.keys(package_manifest.group).length);
			for (let group_id in package_manifest.group) {
				group_progress_text.increase();
				if (show_group_progress) {
					Output.i(`${group_progress_text} ${group_id}`);
				}
				if (group_id.startsWith('__MANIFESTGROUP__')) {
					continue;
				}
				let package_group = package_manifest.group[group_id];
				let group = resource_manifest.group[group_id];
				if (group === undefined) {
					throw new MyError(`group not found in resource manifest : ${group_id}`);
				}
				for (let subgroup_id in package_group.subgroup) {
					let package_subgroup = package_group.subgroup[subgroup_id];
					let subgroup = group.subgroup[subgroup_id];
					if (subgroup === undefined) {
						throw new MyError(`subgroup not found in resource manifest : ${subgroup_id}`);
					}
					for (let package_resource of package_subgroup.resource) {
						let resource: null | Manifest.Resource = null;
						let resource_id = '';
						for (let k in subgroup.resource) {
							let resource_path = package_resource.path.toLowerCase();
							if (resource_path.endsWith('.ptx')) {
								resource_path = resource_path.slice(0, -4);
							}
							if (subgroup.resource[k].path.toLowerCase() === resource_path) {
								resource_id = k;
								resource = subgroup.resource[k];
								break;
							}
						}
						if (resource === null) {
							throw new MyError(`resource not found in resource manifest : ${package_resource.path}`);
						}
						work(
							[group_id, group, package_group],
							[subgroup_id, subgroup, package_subgroup],
							[resource_id, resource, package_resource],
						);
					}
				}
			}
			return;
		};
		{
			Output.v(`恢复文件路径大小写...`);
			let resource_path_list: string[] = [];
			iterate_manifest(false)((group, subgroup, resource) => {
				resource_path_list.push(`${resource[1].path}${(resource[1].expand[0] === 'atlas' ? '.ptx' : '')}`);
			});
			let rename_tree = (
				parent: string,
				tree: PathUtility.Tree,
			) => {
				for (let name in tree) {
					CoreX.FileSystem.rename(parent, name, name);
					if (tree[name] !== null) {
						rename_tree(`${parent}/${name}`, tree[name]!);
					}
				}
			};
			let resource_path_tree = PathUtility.to_tree(resource_path_list);
			rename_tree(resource_directory, resource_path_tree);
		}
		Output.v(`提取资源...`);
		iterate_manifest(true)((group, subgroup, resource) => {
			let path = resource[1].path;
			if (extract_json !== null && path.endsWith('.rton')) {
				Output.v(`${path}`, +1);
				try {
					if (extract_json.crypt_key !== null) {
						CoreX.Tool.RTON.decrypt_then_decode_fs(
							`${resource_directory}/${path}`,
							`${extract_json.directory}/${path.slice(0, -4)}json`,
							true,
							extract_json.crypt_key,
						);
					} else {
						CoreX.Tool.RTON.decode_fs(
							`${resource_directory}/${path}`,
							`${extract_json.directory}/${path.slice(0, -4)}json`,
							true,
						);
					}
				} catch (e: any) {
					Output.e(`解码失败`);
					Output.e(`${e}`);
				}
			}
			if (extract_image !== null && resource[1].expand[0] === 'atlas') {
				Output.v(`${path}`, +1);
				try {
					let atlas_information = resource[1].expand[1] as Manifest.AtlasResourceInformation;
					let atlas_information_source = resource[2].expand as Core.Tool.Package.RSB.Information.JS_N.AtlasResourceInformation;
					let size = atlas_information.size;
					let actual_size = atlas_information_source.size;
					let format = extract_image.texture_format_map.find((e) => (e.index === atlas_information_source.format));
					if (format === undefined) {
						throw new MyError(`unknown format : ${atlas_information_source.format}`);
					}
					Output.v(`size : [ ${make_prefix_padded_string(size[0].toString(), ' ', 4)}, ${make_prefix_padded_string(size[1].toString(), ' ', 4)} ] , actual_size : [ ${make_prefix_padded_string(actual_size[0].toString(), ' ', 4)}, ${make_prefix_padded_string(actual_size[1].toString(), ' ', 4)} ] , format : ${format.format}`, +2);
					let data = CoreX.FileSystem.read_file(`${resource_directory}/${path}.ptx`);
					let data_stream = Core.ByteStreamView.look(data.view());
					let image = Core.Tool.Image.Bitmap.alloc(Core.Tool.Image.ImageSize.value(atlas_information_source.size));
					let image_view = image.view();
					Support.PopcapTexture.decode(data_stream, image_view, format.format);
					let atlas_view = image_view;
					if (extract_image.resize) {
						atlas_view = atlas_view.sub_view(Core.Tool.Image.ImagePosition.value([0n, 0n]), Core.Tool.Image.ImageSize.value(size));
					}
					Core.Tool.Image.File.PNG.write_file(Core.Path.value(`${extract_image.directory}/${path}.png`), atlas_view);
					if (extract_image.split) {
						for (let sprite_id in atlas_information.sprite) {
							let sprite = atlas_information.sprite[sprite_id];
							let sprite_view = atlas_view.sub_view(
								Core.Tool.Image.ImagePosition.value(sprite.position),
								Core.Tool.Image.ImageSize.value(sprite.size),
							);
							// if windows
							let safe_sprite_path = sprite.path.replaceAll(/ [\\/]/g, '#/');
							Core.Tool.Image.File.PNG.write_file(Core.Path.value(`${extract_image.directory}/${safe_sprite_path}.png`), sprite_view);
						}
					}
				} catch (e: any) {
					Output.e(`解码失败`);
					Output.e(`${e}`);
				}
			}
			if (extract_animation !== null && path.endsWith('.pam')) {
				Output.v(`${path}`, +1);
				try {
					let raw_file = `${path}.json`;
					let flash_directory = `${path}.xfl`;
					let computed_file = `${path}.computed.json`;
					let data = CoreX.FileSystem.read_file(`${resource_directory}/${path}`);
					let data_stream = Core.ByteStreamView.look(data.view());
					let information = Core.Tool.Animation.PopcapAnimation.Information.Animation.default();
					Core.Tool.Animation.PopcapAnimation.Decode.decode(
						data_stream,
						information,
					);
					let information_json = information.json;
					let information_js = information_json.value;
					if (extract_animation.raw) {
						CoreX.JSON.write_fs(`${extract_animation.directory}/${raw_file}`, information_json);
					}
					if (extract_animation.flash !== null) {
						let flash_package = Support.PopcapAnimation.Convert.Flash.From.from(
							information_js,
							extract_animation.flash.image_resolution,
						);
						Support.PopcapAnimation.Convert.Flash.save_flash_package(flash_package, `${extract_animation.directory}/${flash_directory}`);
					}
					if (extract_animation.computed) {
						let computed_information = Support.PopcapAnimation.Convert.Compute.compute(information_js);
						CoreX.JSON.write_fs_js(`${extract_animation.directory}/${computed_file}`, computed_information);
					}
				} catch (e: any) {
					Output.e(`解码失败`);
					Output.e(`${e}`);
				}
			}
			if (extract_audio !== null && path.endsWith('.wem')) {
				Output.v(`${path}`, +1);
				try {
					CoreX.Tool.Audio.WwiseEncodedMedia.decode_fs(
						`${resource_directory}/${path}`,
						`${extract_audio.directory}/${path.slice(0, -3)}wav`,
						extract_audio.tool.ffmpeg,
						extract_audio.tool.ww2ogg,
						extract_audio.tool.ww2ogg_pcb,
						extract_audio.temp_directory,
					);
				} catch (e: any) {
					Output.e(`解码失败`);
					Output.e(`${e}`);
				}
			}
		});
		return;
	}

	/**
	 * 从数据包中直接提取资源与清单
	 * @param package_file 包文件路径
	 * @param manifest_file 包清单文件路径
	 * @param resource_manifest_file 资源清单文件路径
	 * @param resource_directory 资源目录路径
	 * @param extract_json 提取JSON选项
	 * @param extract_image 提取图像选项
	 * @param extract_animation 提取动画选项
	 * @param extract_audio 提取音频选项
	 */
	export function extract_package(
		package_file: string,
		manifest_file: string,
		resource_manifest_file: string,
		resource_directory: string,
		extract_json: null | {
			directory: string;
			crypt_key: null | string;
		},
		extract_image: null | {
			directory: string;
			texture_format_map: TextureFormatMap;
			resize: boolean;
			split: boolean;
		},
		extract_animation: null | {
			directory: string;
			raw: boolean;
			flash: null | {
				image_resolution: bigint;
			};
			computed: boolean;
		},
		extract_audio: null | {
			directory: string;
			tool: {
				ffmpeg: string;
				ww2ogg: string;
				ww2ogg_pcb: string;
			};
			temp_directory: string;
		},
	): void {
		Output.v(`解包...`);
		let package_manifest: Core.Tool.Package.RSB.Information.JS_N.Package;
		{
			let package_data = CoreX.FileSystem.read_file(package_file);
			let package_stream = Core.ByteStreamView.look(package_data.view());
			let manifest = Core.Tool.Package.RSB.Information.Package.default();
			Core.Tool.Package.RSB.Unpack.unpack(
				package_stream,
				manifest,
				Core.Null.default(),
				Core.PathOptional.value(resource_directory),
				Core.PathOptional.value(null),
			);
			package_data.free();
			let manifest_json = manifest.json;
			package_manifest = manifest_json.value;
			CoreX.JSON.write_fs(manifest_file, manifest_json);
		}
		Output.v(`提取资源清单文件...`);
		let official_resource_manifest: OfficialManifest.Package;
		{
			let group_id = Object.keys(package_manifest.group).filter((e) => (/__MANIFESTGROUP__(.+)?/.test(e)));
			if (group_id.length === 0) {
				throw new MyError(`can not found manifest group`);
			}
			if (group_id.length > 1) {
				throw new MyError(`too many manifest group`);
			}
			let group = package_manifest.group[group_id[0]];
			if (group.composite) {
				throw new MyError(`manifest should not be a composite group`);
			}
			let subgroup_id = Object.keys(group.subgroup);
			if (subgroup_id.length !== 1) {
				throw new MyError(`manifest subgroup must has one only subgroup`);
			}
			if (subgroup_id[0] !== group_id[0]) {
				throw new MyError(`manifest subgroup id must equal group id`);
			}
			let subgroup = group.subgroup[subgroup_id[0]];
			if (subgroup.resource.length !== 1) {
				throw new MyError(`manifest subgroup must has one only resource`);
			}
			let resource = subgroup.resource[0];
			if (/properties\/resources(_.+)?\.rton/.test(resource.path)) {
				throw new MyError(`manifest resource path invalid`);
			}
			let rton = CoreX.FileSystem.read_file(resource_directory + '/' + resource.path);
			let rton_stream = Core.ByteStreamView.look(rton.view());
			let json = Core.JSON.Value.default<OfficialManifest.Package>();
			Core.Tool.RTON.Decode.decode(
				rton_stream,
				json,
				Core.Boolean.value(true),
			);
			official_resource_manifest = json.value;
		}
		Output.v(`解析资源清单...`);
		let resource_manifest = ManifestConvert.from_official(official_resource_manifest);
		CoreX.JSON.write_fs(resource_manifest_file, Core.JSON.Value.value(resource_manifest));
		extract(
			package_manifest,
			resource_manifest,
			resource_directory,
			extract_json,
			extract_image,
			extract_animation,
			extract_audio,
		);
		return;
	}

}