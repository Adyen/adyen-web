import { getComponent, getComponentConfiguration } from '../..';
import { filterPresent, filterAvailable } from './filters';
import { PaymentMethod } from '~/types';

const FALLBACK_COMPONENT = 'redirect';

/**
 * Returns a filtered (available) list of component Elements
 * @param components -
 * @param props - Props to be passed through to every component
 * @param componentsConfig - Specific config per payment method (where key is the name of the component)
 */
const createElements = (components: PaymentMethod[] = [], props, componentsConfig = {}) => {
    const createElement = component => {
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
