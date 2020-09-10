module.exports = {
    plugins: [require('stylelint')({ configFile: 'config/stylelint.config.js' }), require('autoprefixer'), require('cssnano')]
};
