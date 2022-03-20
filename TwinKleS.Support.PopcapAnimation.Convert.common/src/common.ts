/** PAM转换 */
namespace TwinKleS.Support.PopcapAnimation.Convert {

	// ------------------------------------------------

	export type Transform = [number, number, number, number, number, number];

	export const k_initial_transform: Transform = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0];

	export function mix_transform(
		source: Transform,
		change: Transform,
	): Transform {
		return [
			change[0] * source[0] + change[2] * source[1],
			change[1] * source[0] + change[3] * source[1],
			change[0] * source[2] + change[2] * source[3],
			change[1] * source[2] + change[3] * source[3],
			change[0] * source[4] + change[2] * source[5] + change[4],
			change[1] * source[4] + change[3] * source[5] + change[5],
		];
	}

	export function compute_transform_of_raw_variant_transform(
		transform: Core.Tool.Animation.PopcapAnimation.Information.JS_N.VariantTransform,
	): Transform {
		let result: Transform;
		if (transform.length === 2) {
			result = [
				1.0, 0.0, 0.0, 1.0,
				transform[1 - 1],
				transform[2 - 1],
			];
		} else if (transform.length === 6) {
			result = [...transform];
		} else if (transform.length === 3) {
			let cos_value = Math.cos(transform[1 - 1]);
			let sin_value = Math.sin(transform[1 - 1]);
			result = [
				cos_value,
				sin_value,
				-sin_value,
				cos_value,
				transform[2 - 1],
				transform[3 - 1],
			];
		} else {
			throw new MyError(`invalid transform size`);
		}
		return result;
	}

	// ------------------------------------------------

	export type Color = [number, number, number, number];

	export const k_initial_color: Color = [1.0, 1.0, 1.0, 1.0];

	// ------------------------------------------------

}