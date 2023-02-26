const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { resolve } = require('./util');
const waylonMdLoader = require('./loaders');

module.exports = () => {
    return {
        mode: 'development',
        entry: resolve('src/index.js'),
        output: {
            path: resolve('lib'),
            filename: 'index.js',
            chunkFilename: '[id].js',
            clean: true
        },
        resolve: {
            extensions: ['.js'],
            alias: {
                '@': resolve('src'),
            },
            modules: ['node_modules']
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
                    sideEffects: true // 有副作用 支持import css 配合Tree Shaking
                },
                {
                    test: /\.(svg|gif|png|jpe?g)$/,
                    type: 'asset/inline'
                },
                {
                    test: /\.(otf|ttf|woff2?|eot)$/,
                    type: 'asset/inline'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: '@waylon/md-loader',
                filename: 'index.html',
                template: resolve('public/index.html')
            })
        ],
        optimization: {
            usedExports: true
        },
        devServer: {
            hot: true,
            open: false,
            host: 'localhost',
            port: 2513 //'origin'
        }
    };
};
