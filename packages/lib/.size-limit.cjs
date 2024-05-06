module.exports = [
    /**
     * UMD
     */
    {
        name: 'UMD',
        path: 'dist/umd/adyen.js',
        limit: '100 KB',
        running: false,
    },
    /**
     * 'auto' bundle with all Components included, excluding Languages
     */
    {
        name: 'Auto',
        path: 'auto/auto.js',
        import: "{ AdyenCheckout, Dropin }",
        limit: '105 KB',
        running: false,
    },
    /**
     * ES modules (tree-shake)
     */
    {
        name: 'ESM - Core',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout }",
        limit: '25 KB',
        running: false,
    },
    {
        name: 'ESM - Core + Card',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout, Card }",
        limit: '62 KB',
        running: false,
    },
    {
        name: 'ESM - Core + Dropin with Card and Ideal',
        path: 'dist/es/index.js',
        import: "{ AdyenCheckout, Dropin, Card, Ideal }",
        limit: '68 KB',
        running: false,
    },
]
