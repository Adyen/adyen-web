module.exports = {
    plugins: [
        require('postcss-import')({
            plugins: [require('stylelint')({ configFile: 'stylelint.config.js' })]
        }),
        require('postcss-reporter')({ clearReportedMessages: true }),
        require('autoprefixer'),
        require('cssnano')({ preset: ['default', { colormin: false }] })
    ]
};
