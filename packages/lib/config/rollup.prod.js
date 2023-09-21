import path from 'path';
import * as dotenv from 'dotenv';
import {
    resolveExtensions,
    loadCommonjsPackage,
    lint,
    replaceValues,
    convertJsonToESM,
    compileCSS,
    compileJavascript,
    generateTypes,
    minify
} from './rollup.plugins.js';

dotenv.config({ path: path.resolve('../../', '.env') });

export default () => {
    return [
        //ESM
        {
            input: 'src/index.ts',
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                lint(),
                replaceValues({ moduleType: 'es' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript(),
                minify()
            ],
            output: [
                {
                    dir: './dist/es',
                    format: 'esm',
                    indent: false,
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

        // ESM-Legacy (Webpack 4)
        {
            input: 'src/index.ts',
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                lint(),
                replaceValues({ moduleType: 'es-legacy' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript({ target: 'es2017' }),
                minify()
            ],
            output: [
                {
                    dir: './dist/es-legacy',
                    format: 'esm',
                    indent: false,
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
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                lint(),
                replaceValues({ moduleType: 'umd' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript(),
                minify({ isESM: false })
            ],
            output: {
                name: 'AdyenCheckout',
                file: 'dist/umd/index.umd.js',
                format: 'umd',
                indent: true,
                sourcemap: false
            }
        },

        // CJS build
        {
            input: 'src/index.ts',
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                lint(),
                replaceValues({ moduleType: 'commonjs' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript({ target: 'es2017' }),
                minify({ isESM: false })
            ],
            output: {
                file: 'dist/cjs/index.cjs',
                format: 'commonjs',
                indent: false
            }
        },

        // Types
        {
            input: 'src/index.ts',
            output: [{ file: './dist/types/index.d.ts', format: 'es' }],
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                lint(),
                convertJsonToESM(),
                compileCSS({ extract: false }),
                compileJavascript(),
                generateTypes()
            ]
        }
    ];
};
