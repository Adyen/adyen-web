import type { StorybookConfig } from '@storybook/html-webpack5';

const path = require('path');
const { parsed: environmentVariables } = require('dotenv').config({
    path: path.resolve('../../', '.env')
});

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                docs: false
            }
        }
    ],
    framework: {
        name: '@storybook/html-webpack5',
        options: {}
    },
    typescript: {
        check: false,
        checkOptions: {}
    },
    features: {
        //postcss: false,
    },
    webpackFinal: async (config, { configType }) => {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: ['/node_modules/', '/!(@adyen/adyen-web/dist)/']
            // aggregateTimeout: 200,
            //poll: 500
        };
        console.log({ config });
        return config;
    },
    env: config => ({
        ...config,
        ...environmentVariables
    })
};

export default config;
