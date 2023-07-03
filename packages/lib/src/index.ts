export * from './tree-shaking-test';
export * from './tree-shaking-test2';
export * from './components/index-new';
export * from './AdyenCheckout';

import * as elements from './components/index-new';

export const components = Object.keys(elements).map(key => elements[key]);

//
// export { components };

// export const

// import { CoreOptions } from './core/types';
// import Checkout from './core';
// /* eslint-enable */
//
// async function AdyenCheckout(props: CoreOptions): Promise<Checkout> {
//     const checkout = new Checkout(props);
//     return await checkout.initialize();
// }
//
// export default AdyenCheckout;
