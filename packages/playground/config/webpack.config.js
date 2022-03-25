module.exports = {
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],
        fallback: {
            fs: 'empty',
            dgram: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        }
    },
    stats: { children: false }
};
