const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackConfig = require('./webpack.config');
const currentVersion = require('./version')();
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3020';
const resolve = dir => path.resolve(__dirname, dir);
const shouldUseSourceMap = true;
module.exports = merge(webpackConfig, {
    mode: 'development',
    plugins: [
        new CleanWebpackPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                __SF_ENV__: JSON.stringify(process.env.SF_ENV || 'build'),
                __CLIENT_KEY__: JSON.stringify(process.env.CLIENT_KEY || null),
                VERSION: JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
                COMMIT_HASH: JSON.stringify(currentVersion.COMMIT_HASH),
                COMMIT_BRANCH: JSON.stringify(currentVersion.COMMIT_BRANCH)
            }
        }),
        new MiniCssExtractPlugin({
            filename: `adyen.css`
        })
    ],
    devtool: 'cheap-module-source-map',

    entry: {
        AdyenCheckout: path.join(__dirname, '../src/index.ts')
    },
    output: {
        pathinfo: true,
        filename: `adyen.js`,
        path: path.join(__dirname, '../dist'),
        library: '[name]',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
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
                                    config: { path: 'config/' },
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
                                options: { config: { path: 'config/' } }
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

    watch: true,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebook/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebook/create-react-app/issues/1065
    watchOptions: {
        // ignore: /node_modules/,
        aggregateTimeout: 200,
        poll: 500
    }
});
