/** 资源清单转换 */
namespace TwinKleS.Support.PvZ2RSB.ManifestConvert {

	// ------------------------------------------------

	/**
	 * 将原生资源清单转换至自定义资源清单
	 * @param source 原生资源清单
	 * @returns 自定义资源清单
	 */
	export function from_official(
		source: OfficialManifest.Package,
	): Manifest.Package {
		let dest: Manifest.Package = {
			group: {},
		};
		for (let source_group of source.groups) {
			if (!(source_group.type in OfficialManifest.GroupType)) {
				throw new MyError(`group type invalid`);
			}
			switch (source_group.type) {
				case OfficialManifest.GroupType.composite: {
					dest.group[source_group.id] = {
						composite: true,
						subgroup: {},
					};
					break;
				}
				case OfficialManifest.GroupType.simple: {
					let source_subgroup = source_group as OfficialManifest.SubgroupInformation;
					let dest_group: Manifest.Group;
					if (source_subgroup.parent === undefined) {
						dest.group[source_group.id] = {
							composite: false,
							subgroup: {},
						};
						dest_group = dest.group[source_group.id];
					} else {
						let dest_group_if = dest.group[source_subgroup.parent];
						if (dest_group_if === undefined) {
							throw new MyError(`subgroup's parent is not found : ${source_group.id}`);
						}
						dest_group = dest_group_if;
					}
					dest_group.subgroup[source_group.id] = {
						category: [
							PvZ2JSONGenericGetter.integer(source_subgroup.res, null),
							PvZ2JSONGenericGetter.string(source_subgroup.loc, null),
						],
						resource: [],
					};
					let dest_subgroup = dest_group.subgroup[source_group.id];
					for (let source_resource of source_subgroup.resources) {
						if ('atlas' in source_resource) {
							dest_subgroup.resource.push({
								id: source_resource.id,
								path: source_resource.path.join('/'),
								type: source_resource.type,
								expand: ['atlas', {
									size: [
										PvZ2JSONGenericGetter.integer(source_resource.width),
										PvZ2JSONGenericGetter.integer(source_resource.height),
									],
									sprite: [],
								}],
							});
						} else if ('parent' in source_resource) {
							let atlas = dest_subgroup.resource.find((e) => (e.id === (source_resource as OfficialManifest.SpriteResourceInformation).parent));
							if (atlas === undefined) {
								throw new MyError(`sprite's parent is not found : ${source_resource.parent}`);
							}
							(atlas.expand[1] as Manifest.AtlasResourceInformation).sprite.push({
								id: source_resource.id,
								path: source_resource.path.join('/'),
								position: [
									PvZ2JSONGenericGetter.integer(source_resource.ax),
									PvZ2JSONGenericGetter.integer(source_resource.ay),
								],
								size: [
									PvZ2JSONGenericGetter.integer(source_resource.aw),
									PvZ2JSONGenericGetter.integer(source_resource.ah),
								],
								padding: [
									PvZ2JSONGenericGetter.integer(source_resource.x, 0n),
									PvZ2JSONGenericGetter.integer(source_resource.y, 0n),
								],
							});
						} else {
							dest_subgroup.resource.push({
								id: source_resource.id,
								path: source_resource.path.join('/'),
								type: source_resource.type,
								expand: ['regular', {}],
							});
						}
					}
					break;
				}
			}
		}
		return dest;
	}

	/** TODO
	 * 将自定义资源清单转换至原生资源清单
	 * @param source 自定义资源清单
	 * @returns 原生资源清单
	 */
	export function to_official(
		source: Manifest.Package,
	): OfficialManifest.Package {
		let dest: OfficialManifest.Package = {
			slot_count: 0n,
			groups: [],
		};
		for (let group_id in source.group) {
			let source_group = source.group[group_id];
			let dest_group: OfficialManifest.Group = {
				id: group_id,
				type: source_group.composite ? OfficialManifest.GroupType.composite : OfficialManifest.GroupType.simple,
				subgroups: [],
			};
			for (let subgroup_id in source_group.subgroup) {
			}
		}
		return dest;
	}

	// ------------------------------------------------

}