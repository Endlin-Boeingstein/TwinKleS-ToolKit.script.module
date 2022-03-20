/** PAM样式运算结果数据结构 */
namespace TwinKleS.Support.PopcapAnimation.Convert.Compute.Information {

	// ------------------------------------------------

	export type Transform = [number, number, number, number, number, number];

	export type Color = [number, number, number, number];

	export type Image = {
		source: string;
		size: [bigint, bigint];
		transform: Transform;
	};

	export type Frame = {
		transform: Transform;
		color: Color;
	};

	export type Layer = {
		image: bigint;
		sprite: bigint[];
		work_area: [bigint, bigint];
		frame: Frame[];
	};

	export type Sprite = {
		name: string;
		frame_rate: bigint;
		frame_count: bigint;
		frame_label: Record<string, bigint>;
		frame_stop: bigint[];
		layer: Record<string, Layer>;
	};

	export type Animation = {
		frame_rate: bigint;
		position: [number, number];
		size: [number, number];
		image: Image[];
		sprite: Sprite[];
		main_sprite: Sprite;
	};

	// ------------------------------------------------

}