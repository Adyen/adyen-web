const path = require('path');

const { parsed: environmentVariables } = require('dotenv').config({ path: path.resolve('../../', '.env') });

module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
    framework: '@storybook/html',
    typescript: {
        check: false,
        checkOptions: {}
    },
    webpackFinal: async (config, { configType }) => {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: [/node_modules/, /!(@adyen\/adyen-web\/dist)/],
            aggregateTimeout: 200,
            poll: 500
        };
        return config;
    },
    env: config => ({
        ...config,
        ...environmentVariables
    })
};
