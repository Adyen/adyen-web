const adyenCheckout = require('../dist/cjs/index.cjs');
const { AdyenCheckout, components } = adyenCheckout;

AdyenCheckout.register(...components);

// TODO: Check if Object.assign is needed
module.exports = Object.assign(AdyenCheckout, adyenCheckout);