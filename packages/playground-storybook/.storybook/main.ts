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
    env: config => ({
        ...config,
        ...environmentVariables
    })
};

export default config;
