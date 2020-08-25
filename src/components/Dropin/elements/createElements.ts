import { getComponent, getComponentConfiguration } from '../..';
import { filterPresent, filterAvailable } from './filters';
import { PaymentMethod } from '../../../types';

const FALLBACK_COMPONENT = 'redirect';

/**
 * Returns a filtered (available) list of component Elements
 * @param components - Array of PaymentMethod objects from the /paymentMethods response
 * @param props - High level props to be passed through to every component (as defined in utils/getCommonsProps)
 * @param componentsConfig - Specific config defined per payment method (where key is the name of the component)
 */
const createElements = (components: PaymentMethod[] = [], props, componentsConfig = {}) => {
    const createElement = component => {
        // Merge:
        // 1. props defined on the PaymentMethod in the response object
        // 2. the high level (Checkout) props
        // 3. specific config for this element (as defined in the paymentMethodsConfiguration object when checkout.create('dropin') is called)
        const componentProps = { ...component, ...props, ...getComponentConfiguration(component.type, componentsConfig), isDropin: true };

        let componentInstance = getComponent(component.type, componentProps);

        // Fallback to redirect if payment method not available and no details are required
        if (!componentInstance && !component.details) {
            componentInstance = getComponent(FALLBACK_COMPONENT, componentProps);
        }

        return componentInstance;
    };

    const elements = components.map(createElement).filter(filterPresent);
    const elementPromises = elements.map(filterAvailable).map(p => p.catch(e => e));

    return Promise.all(elementPromises).then(values => elements.filter((el, i) => values[i] === true));
};

export default createElements;
