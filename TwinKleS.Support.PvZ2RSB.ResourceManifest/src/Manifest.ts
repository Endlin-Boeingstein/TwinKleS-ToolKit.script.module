/** 自定义的规范化资源清单 */
namespace TwinKleS.Support.PvZ2RSB.Manifest {

	// ------------------------------------------------

	export type SpriteResource = {
		id: string;
		path: string;
		position: [bigint, bigint];
		size: [bigint, bigint];
		padding: [bigint, bigint];
	};

	export type RegularResourceInformation = {
	};

	export type AtlasResourceInformation = {
		size: [bigint, bigint];
		sprite: SpriteResource[];
	};

	export enum ResourceType {
		File = 'File',
		Image = 'Image',
		PopAnim = 'PopAnim',
		SoundBank = 'SoundBank',
		DecodedSoundBank = 'DecodedSoundBank',
		RenderEffect = 'RenderEffect',
		PrimeFont = 'PrimeFont',
	};

	export type ResourceBase = {
		id: string;
		path: string;
		type: ResourceType;
	};

	export type Resource = ResourceBase & {
		expand: ['regular' | 'atlas', RegularResourceInformation | AtlasResourceInformation];
	};

	// ------------------------------------------------

	export type SubgroupResolution = bigint;

	export type SubgroupLocale = string;

	export type SubgroupCategory = [null | SubgroupResolution, null | SubgroupLocale];

	export type Subgroup = {
		category: SubgroupCategory;
		resource: Resource[];
	};

	// ------------------------------------------------

	export type Group = {
		composite: boolean;
		subgroup: Record<string, Subgroup>;
	};

	// ------------------------------------------------

	export type Package = {
		group: Record<string, Group>;
	};

	// ------------------------------------------------

}