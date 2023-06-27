import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import eslint from '@rollup/plugin-eslint';
import stylelint from 'rollup-plugin-stylelint';
import pkg from '../package.json';
import path from 'path';
const currentVersion = require('./version')();
require('dotenv').config({ path: path.resolve('../../', '.env') });

const isBundleAnalyzer = process.env.NODE_ENV === 'analyze';

if (process.env.CI !== 'true') {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: Building custom bundle. We recommend using one of the official builds served by our servers or NPM. Check https://docs.adyen.com/checkout for more information.'
    );
}

export const input = 'src/index.ts';

export const watchConfig = {
    chokidar: {
        usePolling: true,
        useFsEvents: false,
        interval: 500
    },
    exclude: 'node_modules/**'
};

export const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export const polyfillPlugin = [
    '@babel/plugin-transform-runtime',
    {
        corejs: 3,
        absoluteRuntime: false
    }
];

export const polyfillPreset = [
    '@babel/preset-env',
    {
        useBuiltIns: false
    }
];

export async function getPlugins(analyze = isBundleAnalyzer) {
    return [
        resolve({ extensions }),
        commonjs(),
        stylelint({ include: 'src/**/*.scss' }),
        eslint({
            include: ['./src/**'],
            exclude: ['./src/**/*.json', './src/**/*.scss']
        }),
        replace({
            values: {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.VERSION': JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
                'process.env.COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
                'process.env.COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
                'process.env.ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
                'process.env.__SF_ENV__': JSON.stringify(process.env.SF_ENV || 'build')
            },
            preventAssignment: true
        }),
        json({ namedExports: false, compact: true, preferConst: true }),
        postcss({
            use: ['sass'],
            config: {
                path: 'config/postcss.config.js'
            },
            sourceMap: true,
            inject: false,
            extract: 'adyen.css'
        }),
        analyze &&
            (await import('rollup-plugin-visualizer')).default({
                title: 'Adyen Web bundle visualizer',
                gzipSize: true
            })
    ];
}

export function getExternals() {
    const peerDeps = Object.keys(pkg.peerDependencies || {});
    const dependencies = Object.keys(pkg.dependencies || {});

    return [/@babel\/runtime/, ...peerDeps, ...dependencies];
}
