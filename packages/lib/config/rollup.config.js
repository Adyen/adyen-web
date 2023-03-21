import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import eslint from '@rollup/plugin-eslint';
import babel from '@rollup/plugin-babel';
import stylelint from 'rollup-plugin-stylelint';
import { terserConfig, modernTerserConfig } from './terser.config';
import pkg from '../package.json';

const currentVersion = require('./version')();
import path from 'path';

require('dotenv').config({ path: path.resolve('../../', '.env') });

if (process.env.CI !== 'true') {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: Building custom bundle. We recommend using one of the official builds served by our servers or NPM. Check https://docs.adyen.com/checkout for more information.'
    );
}

const isProduction = process.env.NODE_ENV === 'production';
const isBundleAnalyzer = process.env.NODE_ENV === 'analyze';

const input = 'src/index.ts';
const watchConfig = {
    chokidar: {
        usePolling: true,
        useFsEvents: false,
        interval: 500
    },
    exclude: 'node_modules/**'
};

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const polyfillPlugin = [
    '@babel/plugin-transform-runtime',
    {
        corejs: 3,
        absoluteRuntime: false
    }
];

const polyfillPreset = [
    '@babel/preset-env',
    {
        useBuiltIns: false
    }
];

async function getPlugins({ compress, analyze, version, modern }) {
    const babelPlugins = modern ? [] : [polyfillPlugin];
    const babelPreset = modern ? [] : [polyfillPreset];

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
                'process.env.VERSION': JSON.stringify(version.ADYEN_WEB_VERSION),
                'process.env.COMMIT_HASH': JSON.stringify(version.COMMIT_HASH),
                'process.env.COMMIT_BRANCH': JSON.stringify(version.COMMIT_BRANCH),
                'process.env.ADYEN_BUILD_ID': JSON.stringify(version.ADYEN_BUILD_ID),
                'process.env.__SF_ENV__': JSON.stringify(process.env.SF_ENV || 'build')
            },
            preventAssignment: true
        }),
        babel({
            configFile: path.resolve(__dirname, '..', 'babel.config.json'),
            extensions,
            exclude: ['node_modules/**', '**/*.test.*'],
            ignore: [/core-js/, /@babel\/runtime/],
            babelHelpers: modern ? 'bundled' : 'runtime',
            plugins: babelPlugins,
            presets: babelPreset
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
        // compress && (await import('rollup-plugin-terser')).terser(modern ? modernTerserConfig : terserConfig),
        analyze &&
            (await import('rollup-plugin-visualizer')).default({
                title: 'Adyen Web bundle visualizer',
                gzipSize: true
            })
    ];
}

function getExternals() {
    const peerDeps = Object.keys(pkg.peerDependencies || {});
    const dependencies = Object.keys(pkg.dependencies || {});

    return [/@babel\/runtime/, ...peerDeps, ...dependencies];
}

export default async () => {
    const plugins = await getPlugins({
        compress: isProduction,
        analyze: isBundleAnalyzer,
        version: currentVersion,
        modern: false
    });

    const modernPlugins = await getPlugins({
        compress: isProduction,
        analyze: isBundleAnalyzer,
        version: currentVersion,
        modern: true
    });

    const build = [
        {
            input,
            external: getExternals(),
            plugins,
            output: [
                {
                    dir: 'dist/es',
                    format: 'es',
                    chunkFileNames: '[name].js',
                    sourcemap: true
                    // ...(!isProduction ? { sourcemap: true } : {})
                },
                {
                    dir: 'dist/cjs',
                    format: 'cjs',
                    exports: 'auto',
                    inlineDynamicImports: true
                }
            ],
            watch: watchConfig
        }
    ];

    // only add modern build and umd when building in production
    if (isProduction) {
        build.push({
            input,
            external: getExternals(),
            plugins: modernPlugins,
            output: [
                {
                    dir: 'dist/es.modern',
                    format: 'esm',
                    chunkFileNames: '[name].js',
                    ...(!isProduction ? { sourcemap: true } : {})
                }
            ],
            watch: watchConfig
        });
        build.push({
            input,
            plugins,
            output: {
                name: 'AdyenCheckout',
                file: pkg['umd:main'],
                format: 'umd',
                inlineDynamicImports: true,
                sourcemap: true
            },
            watch: watchConfig
        });
    }
    return build;
};
