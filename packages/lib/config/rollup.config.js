import babel from '@rollup/plugin-babel';
import { modernTerserConfig, terserConfig } from './terser.config';
import pkg from '../package.json';
import path from 'path';
import { extensions, getExternals, getPlugins, input, polyfillPlugin, polyfillPreset, watchConfig } from './rollup.base.config';

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
        }),
        (await import('rollup-plugin-terser')).terser(modern ? modernTerserConfig : terserConfig)
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
        {
            input,
            external: getExternals(),
            plugins,
            output: [
                {
                    dir: 'dist/es',
                    format: 'es',
                    chunkFileNames: '[name].js'
                },
                {
                    dir: 'dist/cjs',
                    format: 'cjs',
                    exports: 'auto',
                    inlineDynamicImports: true
                }
            ],
            watch: watchConfig
        },
        {
            input,
            external: getExternals(),
            plugins: modernPlugins,
            output: [
                {
                    dir: 'dist/es.modern',
                    format: 'esm',
                    chunkFileNames: '[name].js'
                }
            ],
            watch: watchConfig
        },
        {
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
        }
    ];
};
