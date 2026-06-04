// Custom Jest transformer for ESM-only .mjs files using esbuild.
// Needed because ts-jest cannot transform "type": "module" packages.
const { transformSync } = require('esbuild');

module.exports = {
    process(source, filename) {
        const result = transformSync(source, {
            loader: 'js',
            format: 'cjs',
            sourcemap: 'inline',
            sourcefile: filename,
            target: 'node18',
        });
        return { code: result.code };
    },
};
