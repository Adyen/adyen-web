module.exports = [
    /**
     * UMD
     */
    {
        name: 'UMD',
        path: 'dist/umd/adyen.js',
        limit: '230 KB',
        running: false,
    },
    /**
     * 'auto' bundle with all Components included, excluding Languages
     */
    {
        name: 'Auto',
        path: 'auto/auto.js',
        import: "{ AdyenCheckout, Dropin }",
        limit: '135 KB',
        running: false,
    },
    /**
     * ES modules (tree-shake)
     */
    {
        name: 'ESM - Core',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout }",
        limit: '30 KB',
        running: false,
    },
    {
        name: 'ESM - Core + Card',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout, Card }",
        limit: '75 KB',
        running: false,
    },
    {
        name: 'ESM - Core + Dropin with Card and Ideal',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout, Dropin, Card, Ideal }",
        limit: '80 KB',
        running: false,
    },
    {
        name: 'ESM - Core + Dropin with Card and multiple languages',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout, Dropin, Card, pt_BR, nl_NL, es_ES }",
        limit: '95 KB',
        running: false,
    },
]
