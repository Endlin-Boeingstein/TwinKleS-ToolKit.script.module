/**
 * 注入全局执行器建议
 * + fs.data.hash.md5 哈希值计算-MD5
 */
namespace TwinKleS.Entry.suggestion.fs.data.hash {

	// ------------------------------------------------

	type Config = {
	};

	export function _injector(
		config: Config,
	) {
		g_executor_suggestion.push(
			{
				id: 'fs.data.hash.md5',
				description: '哈希值计算-MD5',
				filter(input, option) {
					return CoreX.FileSystem.exist_file(input);
				},
				worker(input, option) {
					let file = input;
					let result = CoreX.Tool.Data.Hash.MD5.hash_fs(file);
					Output.i(`MD5：${result}`);
				},
			},
		);
	}

	// ------------------------------------------------

}

({
	injector: TwinKleS.Entry.suggestion.fs.data.hash._injector,
});