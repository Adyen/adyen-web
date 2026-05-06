module.exports = [
    /**
     * UMD
     */

    /**
     * These are the results as of 2025-08-08
     *
     *  [
            {
                "name": "UMD",
                "size": 114365,
            },
            {
                "name": "Auto",
                "size": 121065,
            },
            {
                "name": "ESM - Core",
                "size": 24270,
            },
            {
                "name": "ESM - Core + Card",
                "size": 65042,
            },
            {
                "name": "ESM - Core + Dropin with Card",
                "size": 69819,
            }
        ]
     */
    {
        name: 'UMD',
        path: 'dist/umd/adyen.js',
        limit: '128 KB',
        running: false
    },
    /**
     * 'auto' bundle with all Components included, excluding Languages
     */
    {
        name: 'Auto',
        path: 'auto/auto.js',
        import: '{ AdyenCheckout, Dropin }',
        limit: '136 KB',
        running: false
    },
    /**
     * ES modules (tree-shake)
     */
    {
        name: 'ESM - Core',
        path: 'dist/es/index.js',
        import: '{ AdyenCheckout }',
        limit: '36 KB',
        running: false
    },
    {
        name: 'ESM - Core + Card',
        path: 'dist/es/index.js',
        import: '{ AdyenCheckout, Card }',
        limit: '77 KB',
        running: false
    },
    {
        name: 'ESM - Core + Dropin with Card',
        path: 'dist/es/index.js',
        import: '{ AdyenCheckout, Dropin, Card }',
        limit: '84 KB',
        running: false
    }
];
