/**
 * 'auto' uses the legacy bundle in order to be backwards compatible with Webpack 4
 */
import { AdyenCheckout, components } from '../dist/es-legacy/index.js';

const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);

AdyenCheckout.register(...Classes);

export * from '../dist/es-legacy/index.js';
