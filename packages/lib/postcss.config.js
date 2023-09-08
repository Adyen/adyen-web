console.log('Using postcss plugins...');
module.exports = {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    plugins: [require('autoprefixer'), require('cssnano')({ preset: ['default', { colormin: false }] })]
};
