import UIElement from './components/UIElement';

export * from './components';
export * from './AdyenCheckout';

import * as elements from './components';

export const components: (new (props) => UIElement)[] = Object.keys(elements).map(key => elements[key]);
