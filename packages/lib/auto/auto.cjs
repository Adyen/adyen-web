const adyenCheckout = require('../dist/cjs/index.cjs');
const { AdyenCheckout, components } = adyenCheckout;

AdyenCheckout.register(...components);

module.exports = Object.assign(AdyenCheckout, adyenCheckout); // Perhaps object assign not needed?