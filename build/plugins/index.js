class BEvaMicroCpnPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.run.tap('run', () => {
            console.log('开始编译🚀');
        });
        compiler.hooks.emit.tapAsync('BEvaMicroCpnPlugin', (compilation, callback) => {
            const manifest = {};
            for (const name of Object.keys(compilation.assets)) {
                manifest[name] = compilation.assets[name].size();
                // 将生成文件的文件名和大小写入manifest对象
            }
            compilation.assets['manifest.json'] = {
                source() {
                    return JSON.stringify(manifest);
                },
                size() {
                    return this.source().length;
                }
            };
            callback();
        });

        compiler.hooks.done.tap('compilation', () => {
            console.log('恭喜你，没有bug，编译完成~ 🚀');
        });
    }
}

module.exports = BEvaMicroCpnPlugin;
