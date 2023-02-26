const { resolve } = require('./util');
const BEvaMicroCpnPlugin = require('./plugins');
/**
 *
 * @param {*}
 * @returns
 */
module.exports = () => ({
    mode: 'production',
    entry: resolve('../src/index.js'),
    output: {
        path: resolve('../dist'),
        filename: '[name]/index.js',
        chunkFilename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': resolve('../src')
        },
        modules: ['node_modules']
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            {
                test: /\.md$/,
                use: ['./build/loaders/index.js']
            },
            {
                test: /\.css$/,
                use: ['css-loader'],
                sideEffects: true
            },
            {
                test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)$/,
                type: 'asset/inline'
            }
        ]
    },
    plugins: [
        new BEvaMicroCpnPlugin(),
    ]
});
