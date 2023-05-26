import type { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig, defineConfig, loadEnv } from 'vite';
import * as path from 'path';
import * as dotenv from 'dotenv';

const { parsed: environmentVariables } = dotenv.config({
    path: path.resolve('../../', '.env')
});

const config: StorybookConfig = {
    stories: ['../storybook/**/*.stories.mdx', '../storybook/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                docs: false
            }
        }
    ],
    framework: {
        name: '@storybook/preact-vite',
        options: {}
    },
    async viteFinal(config, options) {
        const env = loadEnv(options.configType, path.resolve('../../', '.env'), '');
        return mergeConfig(config, {
            // TODO: expose all env variables, which is not recommended
            define: { 'process.env': env },
            server: {
                watch: {
                    usePolling: true
                }
            }
        });
    }
    /*    env: config => {
        console.log('process.env.IS_HTTPS', process.env.IS_HTTPS);
        const viteEnvVariables = {};
        for (const [key, value] of Object.entries(environmentVariables)) {
            viteEnvVariables[`VITE_${key}`] = value;
        }

        return {
            ...config,
            ...viteEnvVariables
        };
    }*/
};

export default config;
