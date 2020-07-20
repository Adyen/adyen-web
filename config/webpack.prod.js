const webpack = require('webpack');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpackConfig = require('./webpack.config');
const resolve = dir => path.resolve(__dirname, dir);
const currentVersion = require('./version')();
const FILENAME = 'adyen';

const DefinePluginConfig = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {
        VERSION: JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
        COMMIT_HASH: JSON.stringify(currentVersion.COMMIT_HASH),
        COMMIT_BRANCH: JSON.stringify(currentVersion.COMMIT_BRANCH),
        ADYEN_BUILD_ID: JSON.stringify(currentVersion.ADYEN_BUILD_ID)
    }
});

if (process.env.CI !== 'true') {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: Building custom bundle. We recommend using one of the official builds served by our servers or NPM. Check https://docs.adyen.com/checkout for more information.'
    );
}

const shouldUseSourceMap = true;

module.exports = merge(webpackConfig, {
    mode: 'production',
    bail: true,
    devtool: shouldUseSourceMap ? 'source-map' : false,
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

    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        // We want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minification steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // Pending further investigation:
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false
                    },
                    mangle: true,
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true
                    }
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: shouldUseSourceMap,
                extractComments: false
            })
            // new OptimizeCSSAssetsPlugin()
        ]
    },

    plugins: [
        DefinePluginConfig,
        new MiniCssExtractPlugin({
            filename: `${FILENAME}.css`
        })
    ]
});
