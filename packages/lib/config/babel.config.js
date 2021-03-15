module.exports = {
    presets: [
        // [
        //     '@babel/preset-react',
        //     {
        //         pragma: 'h'
        //     }
        // ],
        // ['@babel/preset-typescript', { isTSX: true, allExtensions: true, jsxPragma: 'h' }],
        [
            '@babel/preset-env',
            {
                useBuiltIns: false,
                targets: {
                    chrome: '58',
                    ie: '11'
                }
            }
        ]
    ],
    plugins: [
        ['@babel/plugin-transform-runtime'],
        [
            'polyfill-corejs3',
            {
                method: 'usage-pure',
                targets: {
                    chrome: '58',
                    ie: '11'
                }
            }
        ]
    ]
};
