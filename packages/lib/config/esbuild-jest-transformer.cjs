// Custom Jest transformer for ESM-only .mjs files using esbuild.
// Needed because ts-jest cannot transform "type": "module" packages.
const { transformSync } = require('esbuild');

module.exports = {
    process(source) {
        const result = transformSync(source, { format: 'cjs', loader: 'js' });
        return { code: result.code };
    },
};
