import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import pkg from '../package.json';
const currentVersion = require('./version')();

if (process.env.CI !== 'true') {
    console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: Building custom bundle. We recommend using one of the official builds served by our servers or NPM. Check https://docs.adyen.com/checkout for more information.'
    );
}

let cache;
const isProduction = process.env.NODE_ENV === 'production';
const isBundleAnalyzer = process.env.NODE_ENV === 'analyze';

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
            replace({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'process.env.VERSION': JSON.stringify(currentVersion.ADYEN_WEB_VERSION),
                'process.env.COMMIT_HASH': JSON.stringify(currentVersion.COMMIT_HASH),
                'process.env.COMMIT_BRANCH': JSON.stringify(currentVersion.COMMIT_BRANCH),
                'process.env.ADYEN_BUILD_ID': JSON.stringify(currentVersion.ADYEN_BUILD_ID)
            }),
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
            isProduction && (await import('rollup-plugin-terser')).terser(terserConfig),
            isBundleAnalyzer && (await import('rollup-plugin-visualizer')).default({ title: 'Adyen Web bundle visualizer', gzipSize: true })
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
