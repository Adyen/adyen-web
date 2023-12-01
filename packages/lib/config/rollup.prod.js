import path from 'path';
import * as dotenv from 'dotenv';
import {
    resolveExtensions,
    loadCommonjsPackage,
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
        // ESM
        {
            input: 'src/index.ts',
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                replaceValues({ moduleType: 'es' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript({ sourceMaps: true }),
                minify()
            ],
            output: [
                {
                    dir: './dist/es',
                    format: 'esm',
                    indent: false,
                    sourcemap: true,
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
                replaceValues({ moduleType: 'es-legacy' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript({ target: 'es2017', sourceMaps: true }),
                minify()
            ],
            output: [
                {
                    dir: './dist/es-legacy',
                    format: 'esm',
                    indent: false,
                    sourcemap: true,
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
                replaceValues({ moduleType: 'umd' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript({ sourceMaps: true }),
                minify({ isESM: false })
            ],
            output: {
                name: 'AdyenCheckout',
                file: 'dist/umd/adyen.js',
                format: 'umd',
                indent: true,
                sourcemap: true
            }
        },

        // CJS build
        {
            input: 'src/index.ts',
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                replaceValues({ moduleType: 'commonjs' }),
                convertJsonToESM(),
                compileCSS(),
                compileJavascript({ target: 'es2017', sourceMaps: true }),
                minify({ isESM: false })
            ],
            output: {
                file: 'dist/cjs/index.cjs',
                format: 'commonjs',
                indent: false,
                sourcemap: true
            }
        },

        // Types CJS
        {
            input: 'dist/temp-types/types.d.ts',
            output: [{ file: './dist/cjs/index.d.cts', format: 'commonjs' }],
            external: [/\.scss$/u],
            plugins: [generateTypes()]
        },

        // Types ES
        {
            input: 'dist/temp-types/types.d.ts',
            output: [{ file: './dist/es/index.d.ts', format: 'es' }],
            external: [/\.scss$/u, /\.json$/u],
            plugins: [generateTypes()]
        }
    ];
};
