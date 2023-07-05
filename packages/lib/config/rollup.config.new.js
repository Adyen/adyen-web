import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';
import * as dotenv from 'dotenv';
import currentVersion from './version.js';
import dts from 'rollup-plugin-dts';

dotenv.config({ path: path.resolve('../../', '.env') });

const plugins = ({ minify, isESM }) => {
    return [
        resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
        commonjs(),
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
                path: 'config/postcss.config.cjs'
            },
            sourceMap: true,
            inject: false,
            extract: 'adyen.css'
        }),
        swc(
            defineRollupSwcOption({
                tsconfig: '../tsconfig.json',
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
        ),
        minify && terser({ module: isESM })
    ];
};

export default () => {
    return [
        //ES6 build
        {
            input: 'src/index.ts',
            plugins: plugins({ minify: false, isESM: true }),
            output: [
                {
                    dir: './dist/es',
                    format: 'esm',
                    indent: false,
                    sourcemap: false,
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    chunkFileNames: 'chunks/[name].js',
                    entryFileNames: chunkInfo => {
                        if (chunkInfo.name.includes('node_modules')) {
                            return chunkInfo.name.replace('node_modules', 'external') + '.js';
                        }

                        return '[name].js';
                    }
                }
            ]
        },
        // UMD build
        {
            input: 'src/index.umd.ts',
            plugins: plugins({ minify: false }),
            output: {
                name: 'AdyenCheckout',
                file: 'dist/umd/index.umd.js',
                format: 'umd',
                indent: false,
                sourcemap: true
            }
        },
        // CJS build
        {
            input: 'src/index.ts',
            plugins: plugins({ minify: false }),
            output: {
                file: 'dist/cjs/index.cjs',
                format: 'commonjs',
                indent: false,
                sourcemap: true
            }
        }
    ];
};
