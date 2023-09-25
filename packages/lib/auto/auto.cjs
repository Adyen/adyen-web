const library = require('../dist/cjs/index.cjs');
const { AdyenCheckout, components } = library;

const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);

AdyenCheckout.register(...Classes);

module.exports = library;
