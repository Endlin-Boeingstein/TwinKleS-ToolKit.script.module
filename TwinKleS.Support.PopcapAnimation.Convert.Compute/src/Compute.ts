/** PAM样式运算 */
namespace TwinKleS.Support.PopcapAnimation.Convert.Compute {

	// ------------------------------------------------

	type LayerSlot = {
		parent: bigint[];
		transform: Transform;
		color: Color;
	};

	type FrameSlot = Record<string, LayerSlot>;

	type SpriteSlot = FrameSlot[];

	// ------------------------------------------------

	type ReferenceSlot = {
		index: bigint;
		resource: bigint;
		sprite: boolean;
		begin: bigint;
		transform: Transform;
		color: Color;
	};

	// ------------------------------------------------

	type LayerImageMap = Record<string, bigint>;

	// ------------------------------------------------

	function compute_sprite_slot(
		raw_frame: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Frame[],
		sub_sprite: [SpriteSlot, LayerImageMap][],
		image: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Image[],
	): [SpriteSlot, LayerImageMap] {
		let sprite_slot: SpriteSlot = new Array<FrameSlot>(raw_frame.length);
		let layer_image_map: LayerImageMap = {};
		let reference_slot_list: ReferenceSlot[] = [];
		raw_frame.forEach((frame, frame_index) => {
			sprite_slot[frame_index] = {};
			for (let remove of frame.remove) {
				let i = reference_slot_list.findIndex((e) => (e.index === remove.index));
				if (i === -1) {
					throw new MyError(`layer not found : ${remove.index}`);
				}
				reference_slot_list.splice(i, 1);
			}
			for (let append of frame.append) {
				reference_slot_list.push({
					index: append.index,
					resource: append.resource,
					sprite: append.sprite,
					begin: BigInt(frame_index),
					transform: k_initial_transform,
					color: k_initial_color,
				});
			}
			for (let change of frame.change) {
				let slot = reference_slot_list.find((e) => (e.index === change.index));
				if (slot === undefined) {
					throw new MyError(`layer not found : ${change.index}`);
				}
				slot.transform = compute_transform_of_raw_variant_transform(change.transform);
				if (change.color !== null) {
					slot.color = change.color;
				}
			}
			for (let slot of reference_slot_list) {
				if (!slot.sprite) {
					let layer_id = `_${slot.index}`;
					layer_image_map[layer_id] = slot.resource;
					sprite_slot[frame_index][layer_id] = ({
						parent: [],
						transform: slot.transform,
						color: slot.color,
					});
				} else {
					if (slot.resource >= sub_sprite.length) {
						throw new MyError(`reference invalid`);
					}
					let reference = sub_sprite[Number(slot.resource)];
					let target_frame = (frame_index - Number(slot.begin)) % reference[0].length;
					for (let id in reference[0][target_frame]) {
						let e = reference[0][target_frame][id];
						let layer_id = `_${slot.index}${id}`;
						layer_image_map[layer_id] = reference[1][id];
						sprite_slot[frame_index][layer_id] = {
							parent: [...e.parent, slot.resource],
							transform: mix_transform(e.transform, slot.transform),
							color: slot.color,
						};
					}
				}
			}
		});
		return [sprite_slot, layer_image_map];
	}

	function compute_sprite_layer(
		sprite: SpriteSlot,
		layer_image: LayerImageMap,
		image: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Image[],
	): Record<string, Information.Layer> {
		let result: Record<string, Information.Layer> = {};
		let computed_layer_id = new Set<string>();
		sprite.forEach((frame, frame_index) => {
			for (let layer_id in frame) {
				if (!computed_layer_id.has(layer_id)) {
					computed_layer_id.add(layer_id);
					let tail_frame = sprite.slice(frame_index);
					let final_layer: Information.Frame[] = [];
					let parent_sprite: bigint[] | null = null;
					let duration = tail_frame.length;
					let image_id = layer_image[layer_id];
					for (let i in tail_frame) {
						let e = tail_frame[i];
						let image_layer = e[layer_id];
						if (image_layer === undefined) {
							duration = Number.parseInt(i);
							break;
						}
						final_layer.push({
							transform: image_layer.transform,
							color: image_layer.color,
						});
						if (parent_sprite === null) {
							parent_sprite = image_layer.parent;
						}
					}
					result[layer_id] = {
						image: image_id,
						sprite: parent_sprite!,
						work_area: [BigInt(frame_index), BigInt(duration)],
						frame: final_layer,
					};
				}
			}
		});
		return result;
	}

	function sort_sprite_layer(
		layer: Record<string, Information.Layer>,
	): Record<string, Information.Layer> {
		let sortedID = Object.keys(layer)
			.map((e) => (e.slice(1).split('_').map(Number)))
			.sort((lt, rt) => {
				for (let i = 0; i < lt.length && i < rt.length; ++i) {
					if (lt[i] > rt[i]) {
						return +1;
					}
					if (lt[i] < rt[i]) {
						return -1;
					}
				}
				return 0;
			})
			.map((e) => ('_' + e.join('_')));
		let result: typeof layer = {};
		for (let id of sortedID) {
			result[id] = layer[id];
		}
		return result;
	}

	function compute_sprite_frame_label(
		raw: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Frame[],
	): Information.Sprite['frame_label'] {
		let result: Information.Sprite['frame_label'] = {};
		raw.forEach((e, i) => {
			if (e.label !== null) {
				result[e.label] = BigInt(i);
			}
		});
		return result;
	}

	function compute_sprite_frame_stop(
		raw: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Frame[],
	): Information.Sprite['frame_stop'] {
		let result: Information.Sprite['frame_stop'] = [];
		raw.forEach((e, i) => {
			if (e.stop) {
				result.push(BigInt(i));
			}
		});
		return result;
	}

	function compute_sprite(
		raw: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Sprite,
		slot: SpriteSlot,
		layer_sprite: LayerImageMap,
		image: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Image[],
	): Information.Sprite {
		return {
			name: raw.name,
			frame_rate: raw.frame_rate,
			frame_count: BigInt(raw.frame.length),
			frame_label: compute_sprite_frame_label(raw.frame),
			frame_stop: compute_sprite_frame_stop(raw.frame),
			layer: sort_sprite_layer(compute_sprite_layer(slot, layer_sprite, image)),
		};
	}

	export function compute(
		raw: Core.Tool.Animation.PopcapAnimation.Information.JS_N.Animation,
	): Information.Animation {
		let image: Information.Image[] = raw.image.map((e) => ({
			source: e.name.split('|')[0],
			size: e.size,
			transform: e.transform,
		}));
		let sprite_slot: [SpriteSlot, LayerImageMap][] = [];
		let sprite: Information.Sprite[] = [];
		for (let e of raw.sprite) {
			let slot = compute_sprite_slot(e.frame, sprite_slot, raw.image);
			sprite_slot.push(slot);
			sprite.push(compute_sprite(e, slot[0], slot[1], raw.image));
		}
		let main_sprite_slot = compute_sprite_slot(raw.main_sprite.frame, sprite_slot, raw.image);
		let main_sprite = compute_sprite(raw.main_sprite, main_sprite_slot[0], main_sprite_slot[1], raw.image);
		return {
			frame_rate: raw.frame_rate,
			position: raw.position,
			size: raw.size,
			image: image,
			sprite: sprite,
			main_sprite: main_sprite,
		};
	}

	// ------------------------------------------------

	export function compute_fs(
		raw_file: string,
		ripe_file: string,
	): void {
		let raw = CoreX.JSON.read_fs_js<Core.Tool.Animation.PopcapAnimation.Information.JS_N.Animation>(raw_file);
		let ripe = compute(raw);
		CoreX.JSON.write_fs_js(ripe_file, ripe);
		return;
	}

	// ------------------------------------------------

}