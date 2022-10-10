module.exports = {
    plugins: [
        require('stylelint')({ configFile: 'stylelint.config.js' }),
        require('postcss-reporter')({ clearReportedMessages: true }),
        require('autoprefixer'),
        require('cssnano')({ preset: ['default', { colormin: false }] })
    ]
};
