import type { StorybookConfig } from '@storybook/preact-vite';
import { mergeConfig, loadEnv } from 'vite';
import * as path from 'path';
import Version from '../config/version';
import eslint from '@rollup/plugin-eslint';
import stylelint from 'vite-plugin-stylelint';

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
    async viteFinal(config, options) {
        const env = loadEnv(options.configType, path.resolve('../../', '.env'), '');
        return mergeConfig(config, {
            define: {
                'process.env': env,
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.VERSION': JSON.stringify(Version.ADYEN_WEB_VERSION),
                'process.env.COMMIT_HASH': JSON.stringify(Version.COMMIT_HASH),
                'process.env.COMMIT_BRANCH': JSON.stringify(Version.COMMIT_BRANCH),
                'process.env.ADYEN_BUILD_ID': JSON.stringify(Version.ADYEN_BUILD_ID),
                'process.env.__SF_ENV__': JSON.stringify(env.SF_ENV || 'build')
            },
            resolve: {
                alias: [
                    {
                        // this is required for the SCSS modules
                        find: /^~(.*)$/,
                        replacement: '$1'
                    }
                ]
            },
            server: {
                watch: {
                    usePolling: true
                }
            },
            plugins: [
                stylelint(),
                {
                    ...eslint({
                        include: ['./src/**'],
                        exclude: ['./src/**/*.json', './src/**/*.scss']
                    }),
                    enforce: 'pre',
                    apply: 'serve'
                }
            ]
        });
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
