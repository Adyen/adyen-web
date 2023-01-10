import type { StorybookConfig } from '@storybook/core-common';

const path = require('path');
const { parsed: environmentVariables } = require('dotenv').config({ path: path.resolve('../../', '.env') });

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                docs: false,
            },
        },
        '@storybook/addon-links',
        '@storybook/addon-interactions',
    ],
    framework: '@storybook/html',
    typescript: {
        check: false,
        checkOptions: {}
    },
    features: {
        postcss: false,
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
    // @ts-ignore Property missing in the 'StorybookConfig' type
    env: config => ({
        ...config,
        ...environmentVariables
    })
};

module.exports = config;
