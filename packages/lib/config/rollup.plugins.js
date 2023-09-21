import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import { defineRollupSwcOption, swc } from 'rollup-plugin-swc3';
import currentVersion from './version.js';

export const resolveExtensions = () => resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] });

export const loadCommonjsPackage = () => commonjs();

export const lint = () =>
    eslint({
        include: ['./src/**'],
        exclude: ['./src/**/*.json', './src/**/*.scss']
    });

export const replaceValues = ({ moduleType = undefined } = {}) => {
    if (!moduleType) {
        throw Error('Rollup plugins: replaceValues: moduleType is missing');
    }
    return replace({
        values: {
            'process.env.MODULE_TYPE': JSON.stringify(moduleType),
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.VERSION': JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
            'process.env.COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
            'process.env.COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
            'process.env.ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID),
            'process.env.__SF_ENV__': JSON.stringify(process.env.SF_ENV || 'build')
        },
        preventAssignment: true
    });
};

export const convertJsonToESM = () => json({ namedExports: false, compact: true, preferConst: true });

export const compileCSS = ({ extract = 'adyen.css' } = {}) =>
    postcss({
        use: ['sass'],
        config: {
            path: 'postcss.config.cjs'
        },
        sourceMap: false,
        inject: false,
        extract: extract
    });

export const compileJavascript = ({ target = 'es2022', sourceMaps = false } = {}) =>
    swc(
        defineRollupSwcOption({
            tsconfig: '../tsconfig.json',
            jsc: {
                target: target,
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
            sourceMaps: sourceMaps
        })
    );

export const minify = ({ isESM } = { isESM: true }) => terser({ module: isESM });

export const generateTypes = () => dts();
