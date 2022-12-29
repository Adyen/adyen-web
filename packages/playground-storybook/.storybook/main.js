const checkoutDevServer = require('@adyen/adyen-web-server');

module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
    framework: '@storybook/html',
    webpackFinal: async (config, { configType }) => {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: [/node_modules/, /!(@adyen\/adyen-web\/dist)/],
            aggregateTimeout: 200,
            poll: 500
        };
        return config;
    },
    babel: async options => {
        console.log(options);
        return {
            ...options,
            plugins: [...options.plugins, '@babel/preset-react']
        };
    }
};
