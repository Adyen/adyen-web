/* eslint-disable  import/extensions */
import { AdyenCheckout, components } from '../dist/es/index.js';

const Classes = Object.keys(components).map(key => components[key]);
AdyenCheckout.register(...Classes);

export * from '../dist/es/index.js';
export { default } from '../dist/es/index.js';
