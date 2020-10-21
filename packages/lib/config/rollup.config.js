import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import pkg from '../package.json';

let cache;
const isProduction = process.env.NODE_ENV === 'production';

const terserConfig = {
    output: {
        ecma: 5,
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebook/create-react-app/issues/2488
        ascii_only: true
    }
};

export default async () => [
    {
        input: 'src/index.ts',
        cache,
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                useTsconfigDeclarationDir: true,
                check: false,
                cacheRoot: `./node_modules/.cache/.rts2_cache`
            }),
            json({ namedExports: false, compact: true, preferConst: true }),
            postcss({
                config: 'postcss.config.js',
                sourceMap: true,
                inject: false,
                extract: 'adyen.css'
            }),
            isProduction && (await import('rollup-plugin-terser')).terser(terserConfig)
        ],
        output: [
            {
                dir: 'dist/es',
                format: 'es',
                chunkFileNames: '[name].js'
            },
            {
                name: 'AdyenCheckout',
                file: pkg.browser,
                format: 'umd',
                inlineDynamicImports: true,
                sourcemap: true
            },
            {
                dir: 'dist/cjs',
                format: 'cjs',
                exports: 'auto',
                inlineDynamicImports: true
            }
        ],
        watch: {
            chokidar: {
                usePolling: true,
                useFsEvents: false,
                interval: 500
            }
        }
    }
];
