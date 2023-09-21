import path from 'path';
import * as dotenv from 'dotenv';
import { compileCSS, compileJavascript, convertJsonToESM, lint, loadCommonjsPackage, replaceValues, resolveExtensions } from './rollup.plugins.js';

dotenv.config({ path: path.resolve('../../', '.env') });

export default () => {
    return [
        //ESM build
        {
            input: 'src/index.ts',
            plugins: [
                resolveExtensions(),
                loadCommonjsPackage(),
                lint(),
                replaceValues({ moduleType: 'es' }),
                convertJsonToESM(),
                compileCSS({}),
                compileJavascript({ target: 'es2022' })
            ],
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
            ],
            watch: {
                chokidar: {
                    usePolling: true,
                    useFsEvents: false,
                    interval: 500
                },
                exclude: 'node_modules/**'
            }
        }
    ];
};
