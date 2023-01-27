module.exports = {
    plugins: [
        require('stylelint'),
        require('postcss-reporter'),
        require('autoprefixer'),
        require('cssnano')({ preset: ['default', { colormin: false }] })
    ]
};
