import { AdyenCheckout, components } from '../dist/es/index.js';

AdyenCheckout.register(...components);

export * from '../dist/es/index.js'; // Perhaps not needed?
export default AdyenCheckout;
