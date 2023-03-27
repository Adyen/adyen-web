const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpackConfig = require('./webpack.config');
const checkoutDevServer = require('@adyen/adyen-web-server');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3020';
const resolve = dir => path.resolve(__dirname, dir);

// NOTE: The first page in the array will be considered the index page.
const htmlPages = [
    // { name: 'Drop-in', id: 'Dropin' },
    { name: 'Cards', id: 'Cards' }
    // { name: 'Components', id: 'Components' },
    // { name: 'Gift Cards', id: 'GiftCards' },
    // { name: 'Helpers', id: 'Helpers' },
    // { name: 'Issuer Lists', id: 'IssuerLists' },
    // { name: 'Open Invoices', id: 'OpenInvoices' },
    // { name: 'QR Codes', id: 'QRCodes' },
    // { name: 'Secured Fields', id: 'SecuredFields' },
    // { name: 'Vouchers', id: 'Vouchers' },
    // { name: 'Wallets', id: 'Wallets' },
    // { name: 'Result', id: 'Result' }
];

const htmlPageGenerator = ({ id }, index) =>
    new HTMLWebpackPlugin({
        filename: `${index ? `${id.toLowerCase()}/` : ''}index.html`,
        template: path.join(__dirname, `../src/pages/${id}/${id}.html`),
        templateParameters: () => ({ htmlWebpackPlugin: { htmlPages } }),
        inject: 'body',
        chunks: [`AdyenDemo${id}`],
        chunksSortMode: 'manual'
    });

const entriesReducer = (acc, { id }) => {
    acc[`AdyenDemo${id}`] = path.join(__dirname, `../src/pages/${id}/${id}.js`);
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
                __CLIENT_ENV__: JSON.stringify(process.env.CLIENT_ENV || 'test')
            }
        })
    ],
    devtool: 'cheap-module-source-map',
    entry: {
        ...htmlPages.reduce(entriesReducer, {})
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader']
            },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    {
                        test: [/\.js?$/],
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
                        test: [/\.scss$/, /\.css$/],
                        resolve: { extensions: ['.scss', '.css'] },
                        use: [
                            {
                                loader: 'style-loader'
                            },
                            {
                                loader: 'css-loader'
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
    devServer: {
        // before: app => checkoutDevServer(app),
        port,
        host,
        https: false,

        onBeforeSetupMiddleware: devServer => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }
            checkoutDevServer(devServer.app);
        },

        // inline: true,

        // Enable hot reloading server. It will provide /sockjs-node/ endpoint
        // for the WebpackDevServer client so it can learn when the files were
        // updated. The WebpackDevServer client is included as an entry point
        // in the Webpack development configuration. Note that only changes
        // to CSS are currently hot reloaded. JS changes will refresh the browser.
        hot: true,

        // Enable gzip compression of generated files.
        compress: true

        // Silence WebpackDevServer's own logs since they're generally not useful.
        // // It will still show compile warnings and errors with this setting.
        // clientLogLevel: 'none'

        // Tells dev-server to suppress messages like the webpack bundle information.
        // // Errors and warnings will still be shown.
        // noInfo: true

        // By default files from `contentBase` will not trigger a page reload.
        // watchContentBase: false

        // // Reportedly, this avoids CPU overload on some systems.
        // // https://github.com/facebook/create-react-app/issues/293
        // // src/node_modules is not ignored to support absolute imports
        // // https://github.com/facebook/create-react-app/issues/1065
        // watchOptions: {
        //     ignore: [/node_modules/, /!(@adyen\/adyen-web\/dist)/],
        //     aggregateTimeout: 200,
        //     poll: 500
        // }
    }
});
