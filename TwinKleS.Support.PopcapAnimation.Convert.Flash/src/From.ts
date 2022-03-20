/** PAM转换至Flash */
namespace TwinKleS.Support.PopcapAnimation.Convert.Flash.From {

	// ------------------------------------------------

	function make_source_document(
		name: string,
		image: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Image,
		resolution: bigint,
	): Core.XML.JS_Node {
		const scale = Number(k_standard_resolution) / Number(resolution);
		return xml_create_element('DOMSymbolItem', {
			name: name,
			symbolType: 'graphic',
			...k_xmlns_attribute,
		}, [
			xml_create_element('timeline', {}, [
				xml_create_element('DOMTimeline', {
					name: name,
				}, [
					xml_create_element('layers', {}, [
						xml_create_element('DOMLayer', {}, [
							xml_create_element('frames', {}, [
								xml_create_element('DOMFrame', {
									index: `0`,
								}, [
									xml_create_element('elements', {}, [
										xml_create_element('DOMBitmapInstance', {
											libraryItemName: `${image.name.split('|')[0]}`,
											symbolType: 'graphic',
										}, [
											xml_create_element('matrix', {}, [
												xml_create_element('Matrix', {
													a: `${scale.toFixed(6)}`,
													d: `${scale.toFixed(6)}`,
												}, []),
											]),
										]),
									]),
								]),
							]),
						]),
					]),
				]),
			]),
		]);
	}

	function make_image_document(
		name: string,
		source_name: string,
		image: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Image,
	): Core.XML.JS_Node {
		return xml_create_element('DOMSymbolItem', {
			name: name,
			symbolType: 'graphic',
			...k_xmlns_attribute,
		}, [
			xml_create_element('timeline', {}, [
				xml_create_element('DOMTimeline', {
					name: name,
				}, [
					xml_create_element('layers', {}, [
						xml_create_element('DOMLayer', {}, [
							xml_create_element('frames', {}, [
								xml_create_element('DOMFrame', {
									index: `0`,
								}, [
									xml_create_element('elements', {}, [
										xml_create_element('DOMSymbolInstance', {
											libraryItemName: source_name,
											symbolType: 'graphic',
										}, [
											xml_create_element('matrix', {}, [
												xml_create_element('Matrix', {
													a: `${image.transform[0].toFixed(6)}`,
													b: `${image.transform[1].toFixed(6)}`,
													c: `${image.transform[2].toFixed(6)}`,
													d: `${image.transform[3].toFixed(6)}`,
													tx: `${image.transform[4].toFixed(6)}`,
													ty: `${image.transform[5].toFixed(6)}`,
												}, []),
											]),
											xml_create_element('transformationPoint', {}, [
												xml_create_element('Point', {
													x: `${(-image.transform[4]).toFixed(6)}`,
													y: `${(-image.transform[5]).toFixed(6)}`,
												}, []),
											]),
										]),
									]),
								]),
							]),
						]),
					]),
				]),
			]),
		]);
	}

	function make_sprite_document(
		name: string,
		sprite: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Sprite,
		sub_sprite: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Sprite[],
	): Core.XML.JS_Node {
		let model: Record<number, {
			state: null | boolean;
			resource: bigint;
			sprite: boolean;
			transform: Transform;
			color: Color;
			frame_begin: bigint;
			frame_duration: bigint;
		}> = {};
		let frame_node_list: Record<number, Core.XML.JS_Node[]> = {};
		sprite.frame.forEach((frame, frame_index) => {
			if (frame.remove !== null) {
				for (let e of frame.remove) {
					model[Number(e.index)].state = false;
				}
			}
			if (frame.append !== null) {
				for (let e of frame.append) {
					model[Number(e.index)] = {
						state: null,
						resource: e.resource,
						sprite: e.sprite,
						transform: k_initial_transform,
						color: k_initial_color,
						frame_begin: BigInt(frame_index),
						frame_duration: BigInt(frame_index),
					};
					frame_node_list[Number(e.index)] = [];
					if (frame_index > 0) {
						frame_node_list[Number(e.index)].push(
							xml_create_element('DOMFrame', {
								index: `0`,
								duration: `${frame_index}`,
							}, [])
						);
					}
				}
			}
			if (frame.change !== null) {
				for (let e of frame.change) {
					let layer = model[Number(e.index)];
					layer.state = true;
					layer.transform = compute_transform_of_raw_variant_transform(e.transform);
					if (e.color !== null) {
						layer.color = e.color;
					}
				}
			}
			for (let layer_index in model) {
				let layer = model[layer_index];
				let frame_node = frame_node_list[layer_index];
				if (layer.state !== null) {
					if (frame_node.length > 0) {
						(frame_node[frame_node.length - 1][1] as Core.XML.JS_Element)[1].duration = `${layer.frame_duration}`;
					}
				}
				if (layer.state === true) {
					frame_node.push(
						xml_create_element('DOMFrame', {
							index: `${frame_index}`,
							duration: ``,
						}, [
							xml_create_element('elements', {}, [
								xml_create_element('DOMSymbolInstance', !layer.sprite ? {
									libraryItemName: `image_${layer.resource + 1n}`,
									symbolType: 'graphic',
								} : {
									libraryItemName: `sprite_${layer.resource + 1n}`,
									symbolType: 'graphic',
									loop: 'loop',
									firstFrame: `${(frame_index - Number(layer.frame_begin)) % Number(sub_sprite[Number(layer.resource)].frame.length)}`,
								}, [
									xml_create_element('matrix', {}, [
										xml_create_element('Matrix', {
											a: `${layer.transform[0].toFixed(6)}`,
											b: `${layer.transform[1].toFixed(6)}`,
											c: `${layer.transform[2].toFixed(6)}`,
											d: `${layer.transform[3].toFixed(6)}`,
											tx: `${layer.transform[4].toFixed(6)}`,
											ty: `${layer.transform[5].toFixed(6)}`,
										}, []),
									]),
									xml_create_element('color', {}, [
										xml_create_element('Color', {
											redMultiplier: `${layer.color[0].toFixed(6)}`,
											greenMultiplier: `${layer.color[1].toFixed(6)}`,
											blueMultiplier: `${layer.color[2].toFixed(6)}`,
											alphaMultiplier: `${layer.color[3].toFixed(6)}`,
										}, []),
									]),
								]),
							]),
						])
					);
					layer.state = null;
					layer.frame_duration = 0n;
				}
				if (layer.state === false) {
					delete model[layer_index];
				}
				++layer.frame_duration;
			}
		});
		for (let layer_index in model) {
			let layer = model[layer_index];
			let frame_node = frame_node_list[layer_index];
			(frame_node[frame_node.length - 1][1] as Core.XML.JS_Element)[1].duration = `${layer.frame_duration}`;
			delete model[layer_index];
		}
		return xml_create_element('DOMSymbolItem', {
			name: name,
			symbolType: 'graphic',
			...k_xmlns_attribute,
		}, [
			xml_create_element('timeline', {}, [
				xml_create_element('DOMTimeline', {
					name: name,
				}, [
					xml_create_element('layers', {}, Object.keys(frame_node_list).reverse().map((layer_index) => (
						xml_create_element('DOMLayer', {
							name: `${Number(layer_index) + 1}`,
						}, [
							xml_create_element('frames', {}, frame_node_list[Number(layer_index)]),
						])
					))),
				]),
			]),
		]);
	}

	function make_main_document(
		raw: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Animation,
	): Core.XML.JS_Node {
		let prev_end = {
			label: -1,
			audio: -1,
		};
		let label_node: Core.XML.JS_Node[] = [];
		let command_node: Core.XML.JS_Node[] = [];
		raw.main_sprite.frame.forEach((frame, frame_index) => {
			if (frame.label !== null) {
				if (label_node.length > 0) {
					(label_node[label_node.length - 1][1] as Core.XML.JS_Element)[1].duration = `${frame_index - prev_end.label}`;
				}
				label_node.push(xml_create_element('DOMFrame', {
					index: `${frame_index}`,
					duration: ``,
					name: `${frame.label}`,
				}, []));
				prev_end.label = frame_index;
			}
			if (frame.stop || frame.command !== null) {
				let command_list: string[] = [];
				if (frame.stop) {
					command_list.push(`stop();`);
				}
				if (frame.command !== null) {
					command_list.push(...frame.command.map((e) => (`fscommand("${e.command}", "${e.parameter}");`)));
				}
				if (command_list.length > 0) {
					if (frame_index > 0) {
						command_node.push(xml_create_element('DOMFrame', {
							index: `${prev_end.audio + 1}`,
							duration: `${frame_index - (prev_end.audio + 1)}`,
						}, []));
					}
					command_node.push(xml_create_element('DOMFrame', {
						index: `${frame_index}`,
					}, [
						xml_create_element('Actionscript', {}, [
							xml_create_element('script', {}, [
								xml_create_text(true, command_list.join('\n')),
							]),
						]),
					]));
					prev_end.audio = frame_index;
				}
			}
		});
		if (label_node.length > 0) {
			(label_node[label_node.length - 1][1] as Core.XML.JS_Element)[1].duration = `${raw.main_sprite.frame.length - prev_end.label}`;
		}
		return xml_create_element('DOMDocument', {
			frameRate: `${raw.main_sprite.frame_rate}`,
			width: `${raw.size[0]}`,
			height: `${raw.size[1]}`,
			xflVersion: `${k_xfl_version}`,
			...k_xmlns_attribute,
		}, [
			xml_create_element('media', {}, raw.image.map((e) => (
				xml_create_element('DOMBitmapItem', {
					name: `${e.name.split('|')[0]}`,
					href: `${e.name.split('|')[0]}.png`,
				}, [])
			))),
			xml_create_element('symbols', {}, [
				...raw.image.map((e, i) => (
					xml_create_element('Include', {
						href: `source_${i + 1}.xml`,
					}, [])
				)),
				...raw.image.map((e, i) => (
					xml_create_element('Include', {
						href: `image_${i + 1}.xml`,
					}, [])
				)),
				...raw.sprite.map((e, i) => (
					xml_create_element('Include', {
						href: `sprite_${i + 1}.xml`,
					}, [])
				)),
				xml_create_element('Include', {
					href: `main_sprite.xml`,
				}, []),
			]),
			xml_create_element('timelines', {}, [
				xml_create_element('DOMTimeline', {
					name: 'animation',
				}, [
					xml_create_element('layers', {}, [
						xml_create_element('DOMLayer', {
							name: 'label',
						}, [
							xml_create_element('frames', {}, [...label_node]),
						]),
						xml_create_element('DOMLayer', {
							name: 'command',
						}, [
							xml_create_element('frames', {}, [...command_node]),
						]),
						xml_create_element('DOMLayer', {
							name: 'sprite',
						}, [
							xml_create_element('frames', {}, [
								xml_create_element('DOMFrame', {
									index: `0`,
									duration: `${raw.main_sprite.frame.length}`,
								}, [
									xml_create_element('elements', {}, [
										xml_create_element('DOMSymbolInstance', {
											libraryItemName: `main_sprite`,
											symbolType: 'graphic',
										}, []),
									]),
								]),
							]),
						]),
					]),
				]),
			]),
		]);
	}

	export function from(
		raw: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Animation,
		resolution: bigint,
	): FlashPackage {
		return {
			extra: {
				origin: raw.position,
				image: raw.image.map((e) => ({
					name: e.name,
					size: e.size,
				})),
				sprite: raw.sprite.map((e) => ({
					name: e.name,
				})),
				main_sprite: {
					name: raw.main_sprite.name,
				},
			},
			document: make_main_document(raw),
			library: {
				source: raw.image.map((e, i) => (make_source_document(`source_${i + 1}`, e, resolution))),
				image: raw.image.map((e, i) => (make_image_document(`image_${i + 1}`, `source_${i + 1}`, e))),
				sprite: raw.sprite.map((e, i) => (make_sprite_document(`sprite_${i + 1}`, e, raw.sprite))),
				main_sprite: make_sprite_document(`main_sprite`, raw.main_sprite, raw.sprite),
			},
		};
	}

	// ------------------------------------------------

	export function from_fs(
		raw_file: string,
		ripe_directory: string,
		resolution: bigint,
	): void {
		let raw = CoreX.JSON.read_fs_js<Core.Tool.Animation.PopcapAnimation.Information.JS_N.Animation>(raw_file);
		let ripe = from(raw, resolution);
		save_flash_package(ripe, ripe_directory);
		return;
	}

	// ------------------------------------------------

}