const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpackConfig = require('./webpack.config');
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
    devtool: shouldUseSourceMap ? 'source-map' : false,
    bail: true,
    plugins: [
        new CleanWebpackPlugin(),
        DefinePluginConfig,
        new MiniCssExtractPlugin({
            filename: `${FILENAME}.css`
        })
    ],
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
    }
});
