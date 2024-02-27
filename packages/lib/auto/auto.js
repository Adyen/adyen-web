/**
 * 'auto' uses the legacy bundle in order to be backwards compatible with Webpack 4
 */
import { AdyenCheckout, components } from '../dist/es-legacy/index.js';
import { BUNDLE_TYPES } from '../config/utils/bundle-types.js';

const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);

AdyenCheckout.register(...Classes);
AdyenCheckout.setBundleType(BUNDLE_TYPES.AUTO);

export * from '../dist/es-legacy/index.js';
