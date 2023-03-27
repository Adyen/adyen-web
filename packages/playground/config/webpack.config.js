module.exports = {
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
    },
    stats: { children: false }

    // // Some libraries import Node modules but don't use them in the browser.
    // // Tell Webpack to provide empty mocks for them so importing them works.
    // node: {
    //     dgram: 'empty',
    //     fs: 'empty',
    //     net: 'empty',
    //     tls: 'empty',
    //     child_process: 'empty'
    // }
};
