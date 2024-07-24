/**
 * 'auto' uses the legacy bundle in order to be backwards compatible with Webpack 4
 *
 * ATTENTION: Do not import anything that is not available inside the /dist folder .
 * 'auto' uses the files that are packed when running 'npm pack'. Make sure that when adding another import, the file
 * is available when generating the tarball that will be published on npm
 */
import { AdyenCheckout, components } from '../dist/es-legacy/index.js';

const { Dropin, ...Components } = components;
const Classes = Object.keys(Components).map(key => Components[key]);

AdyenCheckout.register(...Classes);
AdyenCheckout.setBundleType('auto');

export * from '../dist/es-legacy/index.js';
