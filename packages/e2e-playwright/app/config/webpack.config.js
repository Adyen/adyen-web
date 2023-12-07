const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const checkoutDevServer = require('@adyen/adyen-web-server');
const host = process.env.HOST || '0.0.0.0';
const port = '3024';
const resolve = dir => path.resolve(__dirname, dir);

const basePageDir = path.join(__dirname, `../src/pages/`);
// NOTE: The first page in the array will be considered the index page.
// Automatically get
const htmlPages = fs.readdirSync(basePageDir).map(fileName => ({
    id: fileName
}));

//console.log('htmlPages', htmlPages);

const htmlPageGenerator = ({ id }, index) => {
    console.log('htmlPageGenerator', id, index);
    return new HTMLWebpackPlugin({
        // make Dropin index.html the rest of the pages will have page <lower case ID>.html
        filename: `${id !== 'Dropin' ? `${id.toLowerCase()}/` : ''}index.html`,
        template: path.join(__dirname, `../src/pages/${id}/${id}.html`),
        templateParameters: () => ({ htmlWebpackPlugin: { htmlPages } }),
        inject: 'body',
        chunks: [`AdyenDemo${id}`],
        chunksSortMode: 'manual'
    });
};

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
                oneOf: [
                    {
                        test: [/\.js?$/],
                        include: [resolve('../src')],
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: { configFile: resolve('../../tsconfig.json') }
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
        host: '0.0.0.0',
        https: false,
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
