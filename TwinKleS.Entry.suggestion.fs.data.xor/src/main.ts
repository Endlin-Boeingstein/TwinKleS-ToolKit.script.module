/**
 * 注入全局执行器建议
 * + fs.data.xor.crypt XOR加解密（逐字节）
 */
namespace TwinKleS.Entry.suggestion.fs.data.xor {

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.data.xor.crypt',
				description: 'XOR加解密（逐字节）',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input);
				},
				worker(input, option) {
					let raw_file = input;
					let ripe_file = input_available_path_if_need(raw_file, raw_file.replace(/$/i, '.xor.bin'), '输出路径');
					let key = Input.integer(`请输入密钥（八位无符号整数）`, (value) => ((value >= 0x00n && value <= 0xFFn) ? null : `必须为八位无符号整数`))!;
					CoreX.Tool.Data.Encrypt.XOR.crypt_fs(raw_file, ripe_file, key);
					Output.i(`输出路径：${ripe_file}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.data.xor._injector,
});