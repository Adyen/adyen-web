const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const checkoutDevServer = require('@adyen/adyen-web-server');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3020';
const isHttps = process.env.IS_HTTPS === 'true';
const certPath = process.env.CERT_PATH ?? path.resolve(__dirname, 'localhost.pem');
const certKeyPath = process.env.CERT_KEY_PATH ?? path.resolve(__dirname, 'localhost-key.pem');
const httpsConfig = isHttps
    ? {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(certKeyPath)
      }
    : false;
const resolve = dir => path.resolve(__dirname, dir);

// NOTE: The first page in the array will be considered the index page.
const htmlPages = [
    { name: 'Drop-in', id: 'Dropin' },
    { name: 'Cards', id: 'Cards' },
    { name: 'Components', id: 'Components' },
    { name: 'Gift Cards', id: 'GiftCards' },
    { name: 'Helpers', id: 'Helpers' },
    { name: 'Issuer Lists', id: 'IssuerLists' },
    { name: 'Open Invoices', id: 'OpenInvoices' },
    { name: 'QR Codes', id: 'QRCodes' },
    { name: 'Secured Fields', id: 'SecuredFields' },
    { name: 'Vouchers', id: 'Vouchers' },
    { name: 'Wallets', id: 'wallets' },
    { name: 'Result', id: 'Result' }
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

module.exports = {
    mode: 'development',

    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
    },

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

    watchOptions: {
        ignored: ['/node_modules/', '/!(@adyen/adyen-web/dist)/'],
        aggregateTimeout: 200,
        poll: 500
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
        port,
        host,
        https: httpsConfig,
        hot: true,
        compress: true,
        onBeforeSetupMiddleware: devServer => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }
            checkoutDevServer(devServer.app);
        }
    }
};
