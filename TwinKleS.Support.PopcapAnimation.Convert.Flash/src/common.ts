/** PAM转换Flash */
namespace TwinKleS.Support.PopcapAnimation.Convert.Flash {

	// ------------------------------------------------

	export const k_standard_resolution = 1200n;

	// ------------------------------------------------

	export const k_xfl_content = 'PROXY-CS5';

	export const k_xfl_version = '2.97';

	export const k_xmlns_attribute = {
		'xmlns': 'http://ns.adobe.com/xfl/2008/',
		'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
	};

	// ------------------------------------------------

	export function xml_create_element(
		name: string,
		attribute: Record<string, string>,
		child: Core.XML.JS_Node[],
	): Core.XML.JS_Node {
		return ['element', [name, attribute, child]];
	}

	export function xml_create_text(
		cdata: boolean,
		value: string,
	): Core.XML.JS_Node {
		return ['text', [cdata, value]];
	}

	// ------------------------------------------------

	export type ExtraInformation = {
		origin: [number, number];
		image: {
			name: string;
			size: [bigint, bigint];
		}[];
		sprite: {
			name: string;
		}[];
		main_sprite: {
			name: string;
		};
	};

	// ------------------------------------------------

	export type FlashPackage = {
		extra: ExtraInformation;
		document: Core.XML.JS_Node;
		library: {
			source: Core.XML.JS_Node[];
			image: Core.XML.JS_Node[];
			sprite: Core.XML.JS_Node[];
			main_sprite: Core.XML.JS_Node;
		};
	};

	export function save_flash_package(
		data: FlashPackage,
		directory: string,
	): void {
		CoreX.JSON.write_fs_js(`${directory}/extra.json`, data.extra);
		let xfl_content_data = new ArrayBuffer(k_xfl_content.length);
		let xfl_content_data_view = new DataView(xfl_content_data);
		for (let i = 0; i < k_xfl_content.length; ++i) {
			xfl_content_data_view.setUint8(i, k_xfl_content.charCodeAt(i));
		}
		CoreX.FileSystem.write_file(`${directory}/main.xfl`, xfl_content_data);
		CoreX.XML.write_fs_js(`${directory}/DOMDocument.xml`, data.document);
		data.library.source.forEach((e, i) => {
			CoreX.XML.write_fs_js(`${directory}/LIBRARY/source_${i + 1}.xml`, e);
		});
		data.library.image.forEach((e, i) => {
			CoreX.XML.write_fs_js(`${directory}/LIBRARY/image_${i + 1}.xml`, e);
		});
		data.library.sprite.forEach((e, i) => {
			CoreX.XML.write_fs_js(`${directory}/LIBRARY/sprite_${i + 1}.xml`, e);
		});
		CoreX.XML.write_fs_js(`${directory}/LIBRARY/main_sprite.xml`, data.library.main_sprite);
		return;
	}

	// ------------------------------------------------

}