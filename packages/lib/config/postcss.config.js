module.exports = {
    plugins: [
        require('stylelint')({ configFile: 'config/stylelint.config.js' }),
        require('postcss-reporter'),
        require('autoprefixer'),
        require('cssnano')({ preset: ['default', { colormin: false }] })
    ]
};
