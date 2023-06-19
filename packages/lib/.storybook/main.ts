import type { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig, loadEnv } from 'vite';
import * as path from 'path';
import version = require('../config/version');
import getRollupDevConfig from '../config/rollup.dev.config';
const currentVersion = version();

const config: StorybookConfig = {
    stories: ['../storybook/**/*.stories.mdx', '../storybook/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        {
            name: '@storybook/addon-essentials',
            options: {
                docs: false
            }
        },
        {
            name: '@storybook/addon-a11y'
        }
    ],
    framework: {
        name: '@storybook/preact-vite',
        options: {}
    },
    async viteFinal(config, options) {
        const env = loadEnv(options.configType, path.resolve('../../', '.env'), '');
        const rollupDevConfig = (await getRollupDevConfig())[0];

        return mergeConfig(config, {
            define: {
                'process.env': env,
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.VERSION': JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
                'process.env.COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
                'process.env.COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
                'process.env.ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
                'process.env.__SF_ENV__': JSON.stringify(env.SF_ENV || 'build')
            },
            server: {
                watch: {
                    usePolling: true
                }
            },
            build: { rollupOptions: { ...rollupDevConfig } }
        });
    }
};

export default config;
