module.exports = {
    plugins: [
        require('stylelint')({ configFile: '../stylelint.config.js' }),
        require('postcss-reporter'),
        require('autoprefixer'),
        require('cssnano')({ preset: ['default', { colormin: false }] })
    ]
};
