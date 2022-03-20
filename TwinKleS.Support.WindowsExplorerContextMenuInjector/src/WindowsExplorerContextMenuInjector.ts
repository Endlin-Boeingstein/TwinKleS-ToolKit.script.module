/** Windows资源管理器的右键选项注入 */
namespace TwinKleS.Support.WindowsExplorerContextMenuInjector {

	// ------------------------------------------------

	function es(
		string: string,
	): string {
		let result = '';
		for (let e of string) {
			if (['"', '\\'].includes(e)) {
				result += '\\';
			}
			result += e;
		}
		return result;
	}

	// ------------------------------------------------

	type ValueModel = {
		name: null | string;
		value: string;
	};

	type KeyModel = {
		name: string;
		value: ValueModel[];
		children: KeyModel[];
	};

	// ------------------------------------------------

	function make_inject_code(
		key: KeyModel,
		parent: string,
	): string {
		let code = '';
		let path = `${parent}\\${key.name}`;
		code += `[${path}]\n`;
		for (let e of key.value) {
			code += `${e.name === null ? `@` : `"${es(e.name)}"`}=${`"${es(e.value)}"`}\n`;
		}
		for (let e of key.children) {
			code += '\n';
			code += `${make_inject_code(e, path)}\n`;
		}
		return code;
	}

	function make_remove_code(
		key: string,
	): string {
		return `[-${key}]\n`;
	}

	// ------------------------------------------------

	function make_code(
		app_path: string,
		run_by_wt: boolean,
	): [string, string] {
		let app_path_w = app_path.replaceAll('/', '\\');
		let run_code = `${run_by_wt ? 'wt ' : ''}"${app_path_w}"`;
		let inject_code = '';
		let remove_code = '';
		inject_code += `Windows Registry Editor Version 5.00\n` + '\n';
		remove_code += `Windows Registry Editor Version 5.00\n` + '\n';
		// for any file
		{
			let model: KeyModel = {
				name: `TwinKleS-ToolKit`,
				value: [
					{
						name: `MUIVerb`,
						value: `TKS-TK`,
					},
					{
						name: `Icon`,
						value: `${app_path_w}`,
					},
				],
				children: [
					{
						name: `command`,
						value: [
							{
								name: null,
								value: `${run_code} "%1"`,
							},
						],
						children: [],
					},
				],
			};
			let model_of_background: KeyModel = {
				...model,
				children: [
					{
						name: `command`,
						value: [
							{
								name: null,
								value: `${run_code} "%V"`,
							},
						],
						children: [],
					},
				],
			};
			inject_code += make_inject_code(model, `HKEY_CLASSES_ROOT\\*\\shell`) + '\n';
			inject_code += make_inject_code(model, `HKEY_CLASSES_ROOT\\Directory\\shell`) + '\n';
			inject_code += make_inject_code(model_of_background, `HKEY_CLASSES_ROOT\\Directory\\Background\\shell`) + '\n';
			remove_code += make_remove_code(`HKEY_CLASSES_ROOT\\*\\shell\\TwinKleS-ToolKit`) + '\n';
			remove_code += make_remove_code(`HKEY_CLASSES_ROOT\\Directory\\shell\\TwinKleS-ToolKit`) + '\n';
			remove_code += make_remove_code(`HKEY_CLASSES_ROOT\\Directory\\Background\\shell\\TwinKleS-ToolKit`) + '\n';
		}
		// for special file
		{
			type CommandModel = {
				suggestion_id: string;
				description: string;
			};
			let make_inject_code_of_command = (
				model: CommandModel,
			): string => {
				let { suggestion_id, description } = model;
				return make_inject_code({
					name: `${suggestion_id}`,
					value: [
						{
							name: `MUIVerb`,
							value: `${description}`,
						},
						{
							name: `Icon`,
							value: `${app_path_w}`,
						},
					],
					children: [
						{
							name: `command`,
							value: [
								{
									name: null,
									value: `${run_code} "%1" -suggestion ${suggestion_id}"`,
								},
							],
							children: [],
						}
					],
				}, `HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\CommandStore\\shell\\TwinKleS-ToolKit`);
			};
			let command_list = [
				...Entry.g_executor_suggestion,
				...Entry.g_executor_suggestion_of_batch,
			].map((e) => ({
				suggestion_id: e.id,
				description: e.description,
			}));
			for (let e of command_list) {
				inject_code += make_inject_code_of_command(e);
			}
			remove_code += make_remove_code(`HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\CommandStore\\shell\\TwinKleS-ToolKit`) + '\n';
		}
		{
			type SpecialSupportModel = {
				id: string;
				name: string;
				target: [boolean, null | string[]];
				command: (null | string)[];
			};
			let make_code_of_special_support = (
				model: SpecialSupportModel,
			): [string, string] => {
				let { id, name, target, command } = model;
				let parent = `HKEY_CLASSES_ROOT\\${!target[0] ? `*` : `Directory`}\\shell`;
				let inject_model: KeyModel = {
					name: `TwinKleS-ToolKit:${id}`,
					value: [
						{
							name: `MUIVerb`,
							value: `TKS-TK : ${name}`,
						},
						{
							name: `Icon`,
							value: `${app_path_w}`,
						},
						{
							name: `AppliesTo`,
							value: target[1] === null ? `` : target[1].map((e) => (`System.FileName:~>".${e}"`)).join(` OR `),
						},
						{
							name: `SubCommands`,
							value: command.map((e) => (e === null ? `|` : `TwinKleS-ToolKit\\${e}`)).join(`;`),
						},
					],
					children: [],
				};
				return [
					make_inject_code(inject_model, parent),
					make_remove_code(`${parent}\\TwinKleS-ToolKit:${id}`),
				];
			};
			let special_support_model: SpecialSupportModel[] = [
				{
					id: 'JS:js',
					name: 'JS',
					target: [false, ['js']],
					command: [
						'fs.js.evaluate',
						null,
						'fs.js.compile',
					],
				},
				{
					id: 'JS:js.bin',
					name: 'JS',
					target: [false, ['js.bin']],
					command: [
						'fs.js.run',
					],
				},
				{
					id: 'JSON:json',
					name: 'JSON',
					target: [false, ['json']],
					command: [
						'fs.json.format',
					],
				},
				{
					id: 'RTON:json',
					name: 'RTON',
					target: [false, ['json']],
					command: [
						'fs.rton.encode',
						null,
						'fs.rton.encode_then_encrypt',
					],
				},
				{
					id: 'RTON:rton',
					name: 'RTON',
					target: [false, ['rton']],
					command: [
						'fs.rton.decode',
						null,
						'fs.rton.encrypt',
						'fs.rton.decrypt',
						null,
						'fs.rton.decrypt_then_decode',
					],
				},
				{
					id: 'Package.PAK:pak',
					name: 'Package.PAK',
					target: [false, ['pak']],
					command: [
						'fs.package.pak.unpack',
						null,
						'fs.package.pak.unpack_resource',
					],
				},
				{
					id: 'Package.PAK:pak.package',
					name: 'Package.PAK',
					target: [true, ['pak.package']],
					command: [
						'fs.package.pak.pack',
					],
				},
				{
					id: 'Package.DZ:dz',
					name: 'Package.DZ',
					target: [false, ['dz']],
					command: [
						'fs.package.dz.unpack',
						null,
						'fs.package.dz.unpack_resource',
					],
				},
				{
					id: 'Package.DZ:dz.package',
					name: 'Package.DZ',
					target: [true, ['dz.package']],
					command: [
						'fs.package.dz.pack',
					],
				},
				{
					id: 'Package.RSGP:rsgp',
					name: 'Package.RSGP',
					target: [false, ['rsgp']],
					command: [
						'fs.package.rsgp.unpack',
						null,
						'fs.package.rsgp.unpack_resource',
					],
				},
				{
					id: 'Package.RSGP:rsgp.package',
					name: 'Package.RSGP',
					target: [true, ['rsgp.package']],
					command: [
						'fs.package.rsgp.pack',
					],
				},
				{
					id: 'Package.RSB:rsb',
					name: 'Package.RSB',
					target: [false, ['rsb', 'rsb.smf', 'obb']],
					command: [
						'fs.package.rsb.unpack',
						null,
						'fs.package.rsb.extract_resource',
					],
				},
				{
					id: 'Package.RSB:rsb.package',
					name: 'Package.RSB',
					target: [true, ['rsb.package']],
					command: [
						'fs.package.rsb.pack',
					],
				},
				{
					id: 'Package.RSB:rsb.smf',
					name: 'Package.RSB.SMF',
					target: [false, ['rsb.smf']],
					command: [
						'fs.package.rsb.smf.compress',
						'fs.package.rsb.smf.uncompress',
					],
				},
				{
					id: 'PopcapTexture:png',
					name: 'PopcapTexture',
					target: [false, ['png']],
					command: [
						'fs.image.popcap_texture.encode',
					],
				},
				{
					id: 'PopcapTexture:ptx',
					name: 'PopcapTexture',
					target: [false, ['ptx']],
					command: [
						'fs.image.popcap_texture.decode',
					],
				},
				{
					id: 'PopcapAnimation:pam',
					name: 'PopcapAnimation',
					target: [false, ['pam']],
					command: [
						'fs.animation.popcap_animation.decode',
					],
				},
				{
					id: 'PopcapAnimation:json',
					name: 'PopcapAnimation',
					target: [false, ['pam.json']],
					command: [
						'fs.animation.popcap_animation.encode',
						null,
						'fs.animation.popcap_animation.convert.flash.from',
						'fs.animation.popcap_animation.convert.compute',
					],
				},
				{
					id: 'WwiseSoundBank:bnk',
					name: 'WwiseSoundBank',
					target: [false, ['bnk']],
					command: [
						'fs.audio.wwise_sound_bank.unpack',
					],
				},
				{
					id: 'WwiseSoundBank:bnk.package',
					name: 'WwiseSoundBank',
					target: [true, ['bnk.package']],
					command: [
						'fs.audio.wwise_sound_bank.pack',
					],
				},
				{
					id: 'WwiseEncodedMedia:wem',
					name: 'WwiseEncodedMedia',
					target: [false, ['wem']],
					command: [
						'fs.audio.wwise_encoded_media.decode',
					],
				},
				{
					id: 'batch',
					name: '批处理',
					target: [true, null],
					command: [
						'fs.json.format.batch',
						null,
						'fs.rton.encode.batch',
						'fs.rton.decode.batch',
						null,
						'fs.rton.encrypt.batch',
						'fs.rton.decrypt.batch',
						null,
						'fs.rton.encode_then_encrypt.batch',
						'fs.rton.decrypt_then_decode.batch',
						null,
						'fs.package.rsb.smf.compress.batch',
						'fs.package.rsb.smf.uncompress.batch',
						null,
						'fs.audio.wwise_encoded_media.decode.batch',
					],
				},
			];
			for (let e of special_support_model) {
				let code = make_code_of_special_support(e);
				inject_code += code[0] + '\n';
				remove_code += code[1] + '\n';
			}
		}
		return [inject_code, remove_code];
	}

	export function _entry(
	) {
		const k_output_directory = 'C:\\ProgramData\\TwinKleS\\TwinKleS-ToolKit\\WindowsExplorerContextMenuInjector';
		const k_cli_file = 'C:\\ProgramData\\TwinKleS\\TwinKleS-ToolKit\\cli.exe';
		let run_by_wt = Input.yon([
			`是否通过WindowsTerminal运行CLI程序`, [
				`Terminal提供了更美观的界面，需要在MicrosoftStore中下载安装`,
			]])!;
		let code = make_code(k_cli_file, run_by_wt);
		CoreX.FileSystem.write_file(`${k_output_directory}/inject.reg`, string_to_utf16_data(code[0], 'little', true));
		CoreX.FileSystem.write_file(`${k_output_directory}/remove.reg`, string_to_utf16_data(code[1], 'little', true));
		Output.i(`已完成，文件导出在以下目录中：${k_output_directory}`);
		Output.v(`inject.reg：向右键菜单中导入功能`, +1);
		Output.v(`remove.reg：从右键菜单中移除功能`, +1);
		Output.i(`选择需要执行注册表文件，双击执行(或以regedit运行)即可`);
		CoreX.Process.system(`explorer "${PathUtility.convert_delimiter(k_output_directory, '\\')}"`);
	}

	// ------------------------------------------------

}

TwinKleS.Support.WindowsExplorerContextMenuInjector._entry();