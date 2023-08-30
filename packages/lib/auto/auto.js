import { AdyenCheckout, Dropin, components } from '../dist/es/index.js';

AdyenCheckout.register(...components);

// TODO: Check if exporting all is needed
export * from '../dist/es/index.js';
export default AdyenCheckout;
export { AdyenCheckout, Dropin };
