import babel from '@rollup/plugin-babel';
import path from 'path';
import { extensions, getExternals, getPlugins, input, polyfillPlugin, polyfillPreset, watchConfig } from './rollup.base.config';

async function getDevPlugins() {
    const sharedPlugins = await getPlugins();

    return [
        ...sharedPlugins,
        babel({
            configFile: path.resolve(__dirname, '..', 'babel.config.json'),
            extensions,
            exclude: ['node_modules/**', '**/*.test.*'],
            ignore: [/core-js/, /@babel\/runtime/],
            babelHelpers: 'runtime',
            plugins: [polyfillPlugin],
            presets: [polyfillPreset]
        })
    ];
}

export default async () => {
    const plugins = await getDevPlugins();

    return [
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
};
