/**
 * 注入全局执行器建议
 * + fs.rton.encode RTON编码
 * + fs.rton.decode RTON解码
 * + fs.rton.encrypt RTON加密
 * + fs.rton.decrypt RTON解密
 * + fs.rton.encode_then_encrypt RTON编码并加密
 * + fs.rton.decrypt_then_decode RTON解密并解码
 * + fs.rton.encode.batch [批处理]RTON编码
 * + fs.rton.decode.batch [批处理]RTON解码
 * + fs.rton.encrypt.batch [批处理]RTON加密
 * + fs.rton.decrypt.batch [批处理]RTON解密
 * + fs.rton.encode_then_encrypt.batch [批处理]RTON编码并加密
 * + fs.rton.decrypt_then_decode.batch [批处理]RTON解密并解码
 */
namespace TwinKleS.Entry.suggestion.fs.rton {

	// ------------------------------------------------

	type Config = {
		encode_buffer_size: null | string;
		crypt_key: null | string;
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.rton.encode',
				description: 'RTON编码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.json)$/i.test(input);
				},
				worker(input, option) {
					let json_file = input;
					let rton_file = input_available_path_if_need(json_file, json_file.replace(/(\.json)$/i, '.rton'), '输出路径');
					let rton_data_buffer_size: bigint;
					if (config.encode_buffer_size !== null) {
						Output.v(`预设：用于储存rton输出的内存空间容量：${config.encode_buffer_size}`);
						rton_data_buffer_size = parse_size_string(config.encode_buffer_size);
					} else {
						rton_data_buffer_size = Input.size(`请输入用于储存rton输出的内存空间容量`)!;
					}
					CoreX.Tool.RTON.encode_fs(json_file, rton_file, true, true, true, rton_data_buffer_size);
					Output.i(`输出路径：${rton_file}`);
				},
			},
			{
				id: 'fs.rton.decode',
				description: 'RTON解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rton)$/i.test(input);
				},
				worker(input, option) {
					let rton_file = input;
					let json_file = input_available_path_if_need(rton_file, rton_file.replace(/(\.rton)$/i, '.json'), '输出路径');
					CoreX.Tool.RTON.decode_fs(rton_file, json_file, true);
					Output.i(`输出路径：${json_file}`);
				},
			},
			{
				id: 'fs.rton.encrypt',
				description: 'RTON加密',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rton)$/i.test(input);
				},
				worker(input, option) {
					let plain_file = input;
					let cipher_file = input_available_path_if_need(plain_file, plain_file.replace(/(\.rton)$/i, '.cipher.rton'), '输出路径');
					let key: string;
					if (config.crypt_key !== null) {
						Output.v(`预设：密钥：<hidden>`);
						key = config.crypt_key;
					} else {
						key = Input.string(`请输入密钥`)!;
					}
					CoreX.Tool.RTON.encrypt_fs(plain_file, cipher_file, key);
					Output.i(`输出路径：${cipher_file}`);
				},
			},
			{
				id: 'fs.rton.decrypt',
				description: 'RTON解密',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rton)$/i.test(input);
				},
				worker(input, option) {
					let cipher_file = input;
					let plain_file = input_available_path_if_need(cipher_file, cipher_file.replace(/(\.rton)$/i, '.plain.rton'), '输出路径');
					let key: string;
					if (config.crypt_key !== null) {
						Output.v(`预设：密钥：<hidden>`);
						key = config.crypt_key;
					} else {
						key = Input.string(`请输入密钥`)!;
					}
					CoreX.Tool.RTON.decrypt_fs(cipher_file, plain_file, key);
					Output.i(`输出路径：${plain_file}`);
				},
			},
			{
				id: 'fs.rton.encode_then_encrypt',
				description: 'RTON编码并加密',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.json)$/i.test(input);
				},
				worker(input, option) {
					let json_file = input;
					let rton_file = input_available_path_if_need(json_file, json_file.replace(/(\.json)$/i, '.rton'), '输出路径');
					let key: string;
					if (config.crypt_key !== null) {
						Output.v(`预设：密钥：<hidden>`);
						key = config.crypt_key;
					} else {
						key = Input.string(`请输入密钥`)!;
					}
					let rton_data_buffer_size: bigint;
					if (config.encode_buffer_size !== null) {
						Output.v(`预设：用于储存rton输出的内存空间容量：${config.encode_buffer_size}`);
						rton_data_buffer_size = parse_size_string(config.encode_buffer_size);
					} else {
						rton_data_buffer_size = Input.size(`请输入用于储存rton输出的内存空间容量`)!;
					}
					CoreX.Tool.RTON.encode_then_encrypt_fs(json_file, rton_file, true, true, true, key, rton_data_buffer_size);
					Output.i(`输出路径：${rton_file}`);
				},
			},
			{
				id: 'fs.rton.decrypt_then_decode',
				description: 'RTON解密并解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input) && /.+(\.rton)$/i.test(input);
				},
				worker(input, option) {
					let rton_file = input;
					let json_file = input_available_path_if_need(rton_file, rton_file.replace(/(\.rton)$/i, '.json'), '输出路径');
					let key: string;
					if (config.crypt_key !== null) {
						Output.v(`预设：密钥:<hidden>`);
						key = config.crypt_key;
					} else {
						key = Input.string(`请输入密钥`)!;
					}
					CoreX.Tool.RTON.decrypt_then_decode_fs(rton_file, json_file, true, key);
					Output.i(`输出路径：${json_file}`);
				},
			},
		);
		g_executor_suggestion_of_batch.push(
			{
				id: 'fs.rton.encode.batch',
				description: '[批处理]RTON编码',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.json)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rton_encode'), '输出路径');
					{
						let rton_data_buffer_size: bigint;
						if (config.encode_buffer_size !== null) {
							Output.v(`预设：用于储存rton输出的内存空间容量：${config.encode_buffer_size}`);
							rton_data_buffer_size = parse_size_string(config.encode_buffer_size);
						} else {
							rton_data_buffer_size = Input.size(`请输入用于储存rton输出的内存空间容量`)!;
						}
						let rton_data_buffer = Core.ByteArray.alloc(Core.Size.value(rton_data_buffer_size));
						for (let item of item_list) {
							let json_file = `${source_directory}/${item}`;
							let rton_file = `${dest_directory}/${item.replace(/(\.json)$/i, '.rton')}`;
							try {
								CoreX.Tool.RTON.encode_fs(json_file, rton_file, true, true, true, rton_data_buffer.view());
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
			{
				id: 'fs.rton.decode.batch',
				description: '[批处理]RTON解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.rton)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rton_decode'), '输出路径');
					{
						for (let item of item_list) {
							let rton_file = `${source_directory}/${item}`;
							let json_file = `${dest_directory}/${item.replace(/(\.rton)$/i, '.json')}`;
							try {
								CoreX.Tool.RTON.decode_fs(rton_file, json_file, true);
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
			{
				id: 'fs.rton.encrypt.batch',
				description: '[批处理]RTON加密',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.rton)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rton_encrypt'), '输出路径');
					{
						let key: string;
						if (config.crypt_key !== null) {
							Output.v(`预设：密钥：<hidden>`);
							key = config.crypt_key;
						} else {
							key = Input.string(`请输入密钥`)!;
						}
						for (let item of item_list) {
							let plain_file = `${source_directory}/${item}`;
							let cipher_file = `${dest_directory}/${item}`;
							try {
								CoreX.Tool.RTON.encrypt_fs(plain_file, cipher_file, key);
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
			{
				id: 'fs.rton.decrypt.batch',
				description: '[批处理]RTON解密',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.rton)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rton_decrypt'), '输出路径');
					{
						let key: string;
						if (config.crypt_key !== null) {
							Output.v(`预设：密钥：<hidden>`);
							key = config.crypt_key;
						} else {
							key = Input.string(`请输入密钥`)!;
						}
						for (let item of item_list) {
							let cipher_file = `${source_directory}/${item}`;
							let plain_file = `${dest_directory}/${item}`;
							try {
								CoreX.Tool.RTON.decrypt_fs(cipher_file, plain_file, key);
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
			{
				id: 'fs.rton.encode_then_encrypt.batch',
				description: '[批处理]RTON编码并加密',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.json)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rton_encode_then_encrypt'), '输出路径');
					{
						let key: string;
						if (config.crypt_key !== null) {
							Output.v(`预设：密钥：<hidden>`);
							key = config.crypt_key;
						} else {
							key = Input.string(`请输入密钥`)!;
						}
						let rton_data_buffer_size: bigint;
						if (config.encode_buffer_size !== null) {
							Output.v(`预设：用于储存rton输出的内存空间容量：${config.encode_buffer_size}`);
							rton_data_buffer_size = parse_size_string(config.encode_buffer_size);
						} else {
							rton_data_buffer_size = Input.size(`请输入用于储存rton输出的内存空间容量`)!;
						}
						let rton_data_buffer = Core.ByteArray.alloc(Core.Size.value(rton_data_buffer_size));
						for (let item of item_list) {
							let json_file = `${source_directory}/${item}`;
							let rton_file = `${dest_directory}/${item.replace(/(\.json)$/i, '.rton')}`;
							try {
								CoreX.Tool.RTON.encode_then_encrypt_fs(json_file, rton_file, true, true, true, key, rton_data_buffer.view());
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
			{
				id: 'fs.rton.decrypt_then_decode.batch',
				description: '[批处理]RTON解密并解码',
				filter(input, option) {
					return CoreX.FileSystem.exist_directory(input);
				},
				worker(input, option) {
					let source_directory = input;
					let item_list = CoreX.FileSystem.list_file(source_directory).filter((e) => (/.+(\.rton)$/i.test(e)));
					if (item_list.length === 0) {
						Output.w(`批处理终止：源目录内无可处理文件`);
						return;
					}
					Output.i(`源目录内共有 ${item_list.length} 个可处理文件`);
					let dest_directory = input_available_path_if_need(source_directory, source_directory.replace(/$/i, '.rton_decrypt_then_decode'), '输出路径');
					{
						let key: string;
						if (config.crypt_key !== null) {
							Output.v(`预设：密钥：<hidden>`);
							key = config.crypt_key;
						} else {
							key = Input.string(`请输入密钥`)!;
						}
						for (let item of item_list) {
							let rton_file = `${source_directory}/${item}`;
							let json_file = `${dest_directory}/${item.replace(/(\.rton)$/i, '.json')}`;
							try {
								CoreX.Tool.RTON.decrypt_then_decode_fs(rton_file, json_file, true, key);
							} catch (e: any) {
								Output.e(`处理失败：${item}`);
								Output.e(`${e}`);
							}
						}
					}
					Output.i(`输出路径：${dest_directory}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.rton._injector,
});