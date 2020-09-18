const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackConfig = require('./webpack.config');
const currentVersion = require('./version')();

module.exports = merge(webpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    plugins: [
        new CleanWebpackPlugin(),
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
