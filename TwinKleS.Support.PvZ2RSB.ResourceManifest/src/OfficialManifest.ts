/** PvZ2数据包中原生的资源清单 */
namespace TwinKleS.Support.PvZ2RSB.OfficialManifest {

	// ------------------------------------------------

	export type RegularResourceInformation = {
	};

	export type AtlasResourceInformation = {
		atlas?: boolean;
		width: bigint;
		height: bigint;
	};

	export type SpriteResourceInformation = {
		parent: string;
		ax: bigint;
		ay: bigint;
		aw: bigint;
		ah: bigint;
		x?: bigint;
		y?: bigint;
		aflag?: bigint;
	};

	export type ResourceType = Manifest.ResourceType;

	export type ResourceBase = {
		slot: bigint;
		id: string;
		path: string[];
		type: ResourceType;
	};

	export type Resource = ResourceBase & (RegularResourceInformation | AtlasResourceInformation | SpriteResourceInformation);

	// ------------------------------------------------

	export type SubgroupResolution = Manifest.SubgroupResolution;
	
	export type SubgroupLocale = Manifest.SubgroupLocale;

	export type SubgroupInformation = {
		res?: SubgroupResolution;
		loc?: SubgroupLocale;
		parent?: string;
		resources: Resource[];
	};

	export type GroupInformation = {
		subgroups: {
			id: string;
			res?: SubgroupResolution;
			loc?: SubgroupLocale;
		}[];
	};

	export enum GroupType {
		composite = 'composite',
		simple = 'simple',
	}

	export type GroupBase = {
		id: string;
		type: GroupType;
	};

	export type Group = GroupBase & (GroupInformation | SubgroupInformation);
	
	// ------------------------------------------------

	export type Package = {
		version?: bigint;
		full_resources_digest?: string;
		compatible_resources_digest?: string;
		content_version?: bigint;
		temppath?: string;
		slot_count: bigint;
		groups: Group[];
	};

	// ------------------------------------------------

}