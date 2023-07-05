export * from './components';
export * from './AdyenCheckout';

import * as elements from './components';

// TODO: check types
export const components = Object.keys(elements).map(key => elements[key]);
