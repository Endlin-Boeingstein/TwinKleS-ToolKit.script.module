/** 工具集 */
namespace TwinKleS {

	// ------------------------------------------------

	/**
	 * 生成填充了前缀的字符串
	 * @param source 源串
	 * @param prefix 前缀
	 * @param max_length 结果串的最大长度，有空余则以前缀填充
	 * @returns 填充了前缀的字符串
	 */
	export function make_prefix_padded_string(
		source: any,
		prefix: string,
		max_length: number,
	): string {
		let source_string = `${source}`;
		return `${prefix.repeat(Math.max(0, max_length - source_string.length) / prefix.length)}${source_string}`;
	}

	// ------------------------------------------------

	/**
	 * 生成用于缩进的字符串
	 * @param indent 缩进值；正为进，负为退
	 * @returns 用于缩进的字符串
	 */
	export function make_indent_string(
		indent: number,
	): string {
		return indent < 0 ? '\b\b\b\b'.repeat(-indent) : '    '.repeat(indent);
	}

	/**
	 * 生成缩进后的字符串
	 * @param string 源串
	 * @param indent 缩进值；正为进，负为退
	 * @returns 缩进后的字符串
	 */
	export function make_indented_string(
		string: string,
		indent: number,
	): string {
		return `${make_indent_string(indent)}${string}`;
	}

	// ------------------------------------------------

	/**
	 * 解析用于表示size的字符串
	 * @param string 字符串
	 * @returns 解析值
	 */
	export function parse_size_string(
		string: string,
	): bigint {
		const k_unit_map = {
			b: 1,
			k: 1024,
			m: 1024 * 1024,
			g: 1024 * 1024 * 1024,
		};
		return BigInt(Number.parseInt(`${Number.parseFloat(string.slice(0, -1)) * k_unit_map[string.slice(-1) as 'b' | 'k' | 'm' | 'g']}`));
	}

	// ------------------------------------------------

	/**
	 * 以UTF16编码将字符串转换为二进制数据
	 * @param source 字符串
	 * @param endian 端序
	 * @param bom 是否添加BOM头
	 * @returns 二进制数据
	 */
	export function string_to_utf16_data(
		source: string,
		endian: 'big' | 'little',
		bom: boolean,
	): ArrayBuffer {
		let is_little_endian = endian === 'little';
		let buffer = new ArrayBuffer(source.length * 2 + (bom ? 2 : 0));
		let view = new DataView(buffer);
		let position = 0;
		if (bom) {
			view.setUint16(0, 0xFEFF, is_little_endian);
			++position;
		}
		for (let i = 0; i < source.length; ++i) {
			view.setUint16(position * 2, source.charCodeAt(i), is_little_endian);
			++position;
		}
		return buffer;
	}

	/**
	 * 以UTF16编码将二进制数据转换为字符串
	 * @param source 二进制数据
	 * @param endian 端序，若指定为`parse`，则取第一个编码单元作为BOM
	 * @returns 字符串
	 */
	export function string_from_utf16_data(
		source: DataView,
		endian: 'big' | 'little' | 'parse',
	): string {
		if (source.byteLength < 2 || source.byteLength % 2 !== 0) {
			throw new MyError(`invalid source size`);
		}
		let position = 0;
		let is_little_endian: boolean;
		if (endian === 'parse') {
			let bom = parse_utf16_bom(source);
			if (bom === null) {
				throw new MyError(`invalid bom`);
			}
			is_little_endian = bom;
			++position;
		} else {
			is_little_endian = endian === 'little'
		}
		let result = new Array<string>(source.byteLength / 2);
		while (position * 2 < source.byteLength) {
			result[position] = String.fromCharCode(source.getUint16(position * 2, is_little_endian));
			++position;
		}
		return result.join('');
		//return String.fromCharCode(...result); // error when too many character
	}

	/**
	 * 解析UTF16-BOM
	 * @param data UTF16数据
	 * @returns BOM是否表征为小端，若BOM无效，返回null
	 */
	export function parse_utf16_bom(
		data: DataView,
	): boolean | null {
		if (data.byteLength < 2) {
			return null;
		}
		let bom_first = data.getUint8(0);
		let bom_second = data.getUint8(1);
		if (bom_first === 0xFF && bom_second === 0xFE) {
			return true;
		} else if (bom_first === 0xFE && bom_second === 0xFF) {
			return false;
		} else {
			return null;
		}
	}

	// ------------------------------------------------

}