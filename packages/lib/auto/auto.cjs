const library = require('../dist/cjs/index.cjs');
const { AdyenCheckout, components } = library;

const Classes = Object.keys(components).map(key => components[key]);
AdyenCheckout.register(...Classes);

module.exports = library;
