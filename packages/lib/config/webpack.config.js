const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolve = dir => path.resolve(__dirname, dir);
const FILENAME = 'adyen';
const shouldUseSourceMap = true;

module.exports = {
    entry: {
        AdyenCheckout: path.join(__dirname, '../src/index.ts')
    },
    output: {
        filename: `${FILENAME}.js`,
        path: path.join(__dirname, '../dist'),
        library: '[name]',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
    },
    stats: { children: false },
    module: {
        rules: [
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works just like "file" loader but it also embeds
                    // assets smaller than specified size as data URLs to avoid requests.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    },
                    {
                        test: [/\.js?$/, /\.jsx?$/, /\.ts?$/, /\.tsx?$/],
                        include: [resolve('../src')],
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: { configFile: resolve('../tsconfig.json') }
                            }
                        ]
                    },
                    {
                        test: /\.scss$/,
                        exclude: /\.module.scss$/,
                        resolve: { extensions: ['.scss'] },
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader
                            },
                            {
                                loader: 'css-loader',
                                options: { sourceMap: shouldUseSourceMap }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    postcssOptions: { config: 'config/' },
                                    sourceMap: shouldUseSourceMap
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: { sourceMap: shouldUseSourceMap }
                            }
                        ]
                    },
                    {
                        test: /\.module.scss$/,
                        resolve: { extensions: ['.scss'] },
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader
                            },
                            {
                                loader: 'css-loader',
                                options: { modules: true }
                            },
                            {
                                loader: 'postcss-loader',
                                options: { postcssOptions: { config: 'config/' } }
                            },
                            {
                                loader: 'sass-loader'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
};
