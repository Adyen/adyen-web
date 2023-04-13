import type { StorybookConfig } from '@storybook/html-vite';
import { mergeConfig } from 'vite';

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
        name: '@storybook/html-vite',
        options: {}
    },
    env: config => {
        let viteEnvVariables = {};
        for (const [key, value] of Object.entries(environmentVariables)) {
            viteEnvVariables[`VITE_${key}`] = value;
        }

        return {
            ...config,
            ...viteEnvVariables
        };
    }
};

export default config;
