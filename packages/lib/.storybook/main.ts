import { fileURLToPath } from 'url';
import { join } from 'path';
import { mergeConfig } from 'vite';
import stylelint from 'vite-plugin-stylelint';
import preact from '@preact/preset-vite';
import generateEnvironmentVariables from '../config/environment-variables.js';
import type { StorybookConfig } from '@storybook/preact-vite';

const dirname = fileURLToPath(new URL('.', import.meta.url));

/*
 * This is the build time configuration
 * Configurations here will be define during build step
 */

const certPath = process.env.CERT_PATH ?? join(dirname, 'localhost.pem');
const certKeyPath = process.env.CERT_KEY_PATH ?? join(dirname, 'localhost-key.pem');

const isHttps = process.env.IS_HTTPS === 'true';

const config: StorybookConfig = {
    stories: ['../**/*.docs.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],

    framework: '@storybook/preact-vite',

    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],

    // public added for msw: https://github.com/mswjs/msw-storybook-addon?tab=readme-ov-file#start-storybook
    // '../storybook/public'
    staticDirs: ['../storybook/assets', '../storybook/public'],

    // we are using JSON.stringify to ensure the value is a string, relevant for preview.tsx
    // also makes it consistent to what we do we generateEnvironmentVariables
    viteFinal(config) {
        const finalConfig = mergeConfig(config, {
            // Mirror Rollup's CSS processing exactly
            css: {
                // Use same PostCSS config file as Rollup
                postcss: join(dirname, '../postcss.config.cjs'),

                // Mirror Rollup's SCSS settings
                preprocessorOptions: {
                    scss: {
                        // Ensure @use 'styles/...' resolves
                        loadPaths: [join(dirname, '../src')]
                    }
                },

                // Enable source maps like Rollup
                devSourcemap: true
            },

            // Single CSS file like Rollup's extract behavior
            build: {
                cssCodeSplit: false,
                rollupOptions: {
                    output: {
                        assetFileNames: 'adyen.[ext]' // Matches Rollup's extract: 'adyen.css'
                    }
                }
            },

            define: {
                'process.env.DISABLE_MSW': JSON.stringify(process.env.DISABLE_MSW),
                ...generateEnvironmentVariables(process.env.NODE_ENV)
            },

            resolve: {
                alias: [
                    {
                        // this is required for the SCSS modules
                        find: /^~(.*)$/,
                        replacement: '$1'
                    },
                    {
                        find: /^styles\/(.*)$/,
                        replacement: `${join(dirname, '../src/styles')}/$1`
                    }
                ]
            },

            plugins: [
                preact({
                    devtoolsInProd: true
                }),
                stylelint({ emitErrorAsWarning: true })
            ],

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
