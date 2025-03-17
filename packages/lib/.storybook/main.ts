import type { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig } from 'vite';
import * as path from 'path';
import stylelint from 'vite-plugin-stylelint';
import generateEnvironmentVariables from '../config/environment-variables';
import { resolve } from 'node:path';
import preact from '@preact/preset-vite';

const certPath = process.env.CERT_PATH ?? path.resolve(__dirname, 'localhost.pem');
const certKeyPath = process.env.CERT_KEY_PATH ?? path.resolve(__dirname, 'localhost-key.pem');

const isHttps = process.env.IS_HTTPS === 'true';

const config: StorybookConfig = {
    stories: ['../storybook/**/*.stories.@(js|jsx|ts|tsx)'],

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
        name: getAbsolutePath('@storybook/preact-vite'),
        options: {}
    },

    // public added for msw: https://github.com/mswjs/msw-storybook-addon?tab=readme-ov-file#start-storybook
    // '../storybook/public'
    staticDirs: ['../storybook/assets', '../storybook/public'],

    viteFinal(config) {
        const finalConfig = mergeConfig(config, {
            define: { ...generateEnvironmentVariables(process.env.NODE_ENV), 'process.env.NETLIFY': JSON.stringify(process.env.NETLIFY) },

            resolve: {
                alias: [
                    {
                        // this is required for the SCSS modules
                        find: /^~(.*)$/,
                        replacement: '$1'
                    },
                    { find: /^styles(.*)$/, replacement: resolve(__dirname, '../src/styles') }
                ]
            },

            plugins: [preact(), stylelint({ emitErrorAsWarning: true })],

            server: {
                ...(isHttps && {
                    https: {
                        key: certKeyPath,
                        cert: certPath
                    }
                }),

                watch: {
                    usePolling: true
                },

                proxy: {
                    '/api': {
                        target: `${isHttps ? 'https' : 'http'}://localhost:3030`,
                        secure: false
                    },
                    '/sdk': {
                        target: `${isHttps ? 'https' : 'http'}://localhost:3030`,
                        secure: false
                    }
                }
            }
        });

        return finalConfig;
    }
};
export default config;

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return path.dirname(require.resolve(path.join(value, 'package.json')));
}
