import { filterUnsupported, filterPresent, filterAvailable } from './filters';
import { PaymentMethod } from '../../../types';

/**
 * Returns a filtered (available) list of component Elements
 * @param components - Array of PaymentMethod objects from the /paymentMethods response
 * @param props - High level props to be passed through to every component (as defined in utils/getCommonProps)
 * @param create - Reference to the main instance `create` method
 */
const createElements = (components: PaymentMethod[] = [], props, create) => {
    const elements = components
        .map(c => create(c, props))
        .filter(filterPresent)
        .filter(filterUnsupported);

    // filter available elements
    const elementPromises = elements.map(filterAvailable).map(p => p.catch(e => e));

    return Promise.all(elementPromises).then(values => elements.filter((el, i) => values[i] === true));
};

export default createElements;
