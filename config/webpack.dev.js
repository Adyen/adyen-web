const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpackConfig = require('./webpack.config');
const checkoutDevServer = require('../server');
const currentVersion = require('./version')();
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3020';
const resolve = dir => path.resolve(__dirname, dir);

// NOTE: The first page in the array will be considered the index page.
const htmlPages = [
    { name: 'Drop-in', id: 'Dropin' },
    { name: 'Cards', id: 'Cards' },
    { name: 'Components', id: 'Components' },
    { name: 'Gift Cards', id: 'GiftCards' },
    { name: 'Issuer Lists', id: 'IssuerLists' },
    { name: 'Open Invoices', id: 'OpenInvoices' },
    { name: 'QR Codes', id: 'QRCodes' },
    { name: 'Secured Fields', id: 'SecuredFields' },
    { name: 'Secured Fields Pure', id: 'SecuredFieldsPure' },
    { name: 'Vouchers', id: 'Vouchers' },
    { name: 'Wallets', id: 'Wallets' }
];

const htmlPageGenerator = ({ id }, index) =>
    new HTMLWebpackPlugin({
        filename: `${index ? `${id.toLowerCase()}/` : ''}index.html`,
        template: path.join(__dirname, `../playground/pages/${id}/${id}.html`),
        templateParameters: () => ({ htmlWebpackPlugin: { htmlPages } }),
        inject: 'body',
        chunks: [`AdyenDemo${id}`],
        chunksSortMode: 'manual'
    });

const entriesReducer = (acc, { id }) => {
    acc[`AdyenDemo${id}`] = path.join(__dirname, `../playground/pages/${id}/${id}.js`);
    return acc;
};

module.exports = merge(webpackConfig, {
    mode: 'development',
    plugins: [
        ...htmlPages.map(htmlPageGenerator),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                __SF_ENV__: JSON.stringify(process.env.SF_ENV || 'build'),
                __CLIENT_KEY__: JSON.stringify(process.env.CLIENT_KEY || null),
                VERSION: JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
                COMMIT_HASH: JSON.stringify(currentVersion.COMMIT_HASH),
                COMMIT_BRANCH: JSON.stringify(currentVersion.COMMIT_BRANCH)
            }
        })
    ],
    devtool: 'cheap-module-source-map',
    entry: {
        ...htmlPages.reduce(entriesReducer, {}),
        AdyenCheckout: path.join(__dirname, '../src/index.ts')
    },
    output: {
        pathinfo: true,
        library: '[name]',
        libraryTarget: 'var',
        libraryExport: 'default'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs)$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
                        }
                    }
                ],
                include: [resolve('../src')],
                exclude: [resolve('../node_modules')]
            },
            {
                test: /\.(ts|tsx)$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            emitWarning: true
                        }
                    }
                ],
                include: [resolve('../src')],
                exclude: [resolve('../node_modules')]
            },
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
                        test: [/\.js?$/],
                        include: [resolve('../src'), resolve('../demo')],
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: { configFile: resolve('../tsconfig.json') }
                            }
                        ]
                    },
                    {
                        test: [/\.ts?$/, /\.tsx?$/],
                        include: [resolve('../src'), resolve('../playground')],
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
                                loader: 'style-loader'
                            },
                            {
                                loader: 'css-loader'
                            },
                            {
                                loader: 'postcss-loader',
                                options: { config: { path: 'config/' } }
                            },
                            {
                                loader: 'sass-loader'
                            }
                        ]
                    },
                    {
                        test: /\.module.scss$/,
                        resolve: {
                            extensions: ['.scss']
                        },
                        use: [
                            {
                                loader: 'style-loader'
                            },
                            {
                                loader: 'css-loader',
                                options: { modules: true, sourceMap: true }
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
    devServer: {
        before: app => checkoutDevServer(app),
        port,
        host,
        https: false,
        // publicPath: '/',
        inline: true,

        // Enable hot reloading server. It will provide /sockjs-node/ endpoint
        // for the WebpackDevServer client so it can learn when the files were
        // updated. The WebpackDevServer client is included as an entry point
        // in the Webpack development configuration. Note that only changes
        // to CSS are currently hot reloaded. JS changes will refresh the browser.
        hot: true,

        // Enable gzip compression of generated files.
        compress: true,

        // Silence WebpackDevServer's own logs since they're generally not useful.
        // It will still show compile warnings and errors with this setting.
        clientLogLevel: 'none',

        // By default files from `contentBase` will not trigger a page reload.
        watchContentBase: false,

        // Reportedly, this avoids CPU overload on some systems.
        // https://github.com/facebook/create-react-app/issues/293
        // src/node_modules is not ignored to support absolute imports
        // https://github.com/facebook/create-react-app/issues/1065
        watchOptions: {
            ignore: /node_modules/,
            aggregateTimeout: 200,
            poll: 500
        },

        overlay: false
    }
});
