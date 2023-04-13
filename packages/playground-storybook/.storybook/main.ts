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
        },
        '@storybook/addon-links'
        // '@storybook/addon-interactions',
        // '@storybook/addon-mdx-gfm'
    ],
    core: {
        builder: '@storybook/builder-vite'
    },
    framework: {
        name: '@storybook/html-vite',
        options: {}
    },
    // framework: {
    //     name: '@storybook/html-webpack5',
    //     options: {}
    // },
    // typescript: {
    //     check: false
    //     // checkOptions: {}
    // },
    // features: {
    //     postcss: false
    // },
    // webpackFinal: async (config, {
    //   configType
    // }) => {
    //   config.watchOptions = {
    //     ...config.watchOptions,
    //     ignored: [/node_modules/, /!(@adyen\/adyen-web\/dist)/],
    //     aggregateTimeout: 200,
    //     poll: 500
    //   };
    //   return config;
    // },

    // async viteFinal(config, { configType }) {
    //     return mergeConfig(config, {
    //         define: {
    //             'process.env': {}
    //         }
    //     });
    // },
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
    // docs: {
    //     autodocs: true
    // }
};

export default config;
