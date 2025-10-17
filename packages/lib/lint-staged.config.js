/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
    '*.{js,jsx,ts,tsx}': 'eslint --fix',
    // Use a function here to prevent lint staged from passing the file paths as arguments to tsc
    // This allows tsc to all of the configuration from tsconfig.json
    '*.{ts,tsx}': () => 'tsc --noEmit',
    '*.{scss,css}': 'stylelint --fix',
    '*.{js,jsx,ts,tsx,html,md}': 'prettier --write'
};
