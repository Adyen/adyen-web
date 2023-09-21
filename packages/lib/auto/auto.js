/**
 * 'auto' uses the legacy bundle in order to be backwards compatible with Webpack 4
 */
import { AdyenCheckout, components } from '../dist/es-legacy/index.js';

const Classes = Object.keys(components).map(key => components[key]);
AdyenCheckout.register(...Classes);

export * from '../dist/es-legacy/index.js';
