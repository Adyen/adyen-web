export * from './tree-shaking-test';
export * from './tree-shaking-test2';
export * from './components/index-new';
export * from './AdyenCheckout';

import * as components from './components/index-new';
export { components };

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
