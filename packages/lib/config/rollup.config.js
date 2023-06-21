import babel from '@rollup/plugin-babel';
// import { modernTerserConfig, terserConfig } from './terser.config';
// import pkg from '../package.json';
import path from 'path';
import { extensions, getExternals, getPlugins, input, polyfillPlugin, polyfillPreset, watchConfig } from './rollup.base.config';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import stylelint from 'rollup-plugin-stylelint';
import eslint from '@rollup/plugin-eslint';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';

const currentVersion = require('./version')();
require('dotenv').config({ path: path.resolve('../../', '.env') });

async function getProdPlugins({ modern }) {
    const babelPlugins = modern ? [] : [polyfillPlugin];
    const babelPreset = modern ? [] : [polyfillPreset];
    const sharedPlugins = await getPlugins();

    return [
        ...sharedPlugins,
        babel({
            configFile: path.resolve(__dirname, '..', 'babel.config.json'),
            extensions,
            exclude: ['node_modules/**', '**/*.test.*'],
            ignore: [/core-js/, /@babel\/runtime/],
            babelHelpers: modern ? 'bundled' : 'runtime',
            plugins: babelPlugins,
            presets: babelPreset
        })
        // (await import('rollup-plugin-terser')).terser(modern ? modernTerserConfig : terserConfig)
    ];
}

export default async () => {
    const plugins = await getProdPlugins({
        modern: false
    });

    const modernPlugins = await getProdPlugins({
        modern: true
    });

    return [
        // {
        //     input,
        //     external: getExternals(),
        //     plugins,
        //     output: [
        //         {
        //             dir: 'dist/es',
        //             format: 'es',
        //             chunkFileNames: '[name].js'
        //         },
        //         {
        //             dir: 'dist/cjs',
        //             format: 'cjs',
        //             exports: 'auto',
        //             inlineDynamicImports: true
        //         }
        //     ],
        //     watch: watchConfig
        // },
        // {
        //     input,
        //     external: getExternals(),
        //     plugins: modernPlugins,
        //     output: [
        //         {
        //             dir: 'dist/es.modern',
        //             format: 'esm',
        //             chunkFileNames: '[name].js'
        //         }
        //     ],
        //     watch: watchConfig
        // },
        //ES6 build
        {
            input: 'src/index.ts',
            external: ['preact', 'classnames'],
            // plugins: modernPlugins,
            plugins: [
                resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
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
                swc(
                    defineRollupSwcOption({
                        tsconfig: '../tsconfssig.json',
                        jsc: {
                            target: 'es2022',
                            parser: {
                                syntax: 'typescript'
                            },
                            transform: {
                                react: {
                                    pragma: 'h',
                                    pragmaFrag: 'Fragment'
                                }
                            }
                        },
                        module: {
                            type: 'es6'
                        },
                        sourceMaps: true
                    })
                )
            ],
            output: [
                {
                    dir: './dist/esm',
                    chunkFileNames: 'chunks/[name].js',
                    entryFileNames: '[name].js',
                    format: 'esm',
                    indent: false,
                    sourcemap: true
                    // preserveModules: true,
                }
            ],
            watch: watchConfig
        }
        // {
        //     input,
        //     plugins,
        //     output: {
        //         name: 'AdyenCheckout',
        //         file: pkg['umd:main'],
        //         format: 'umd',
        //         inlineDynamicImports: true,
        //         sourcemap: true
        //     },
        //     watch: watchConfig
        // }
    ];
};
