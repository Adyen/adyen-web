import { filterUnsupported, filterPresent, filterAvailable } from './filters';
import { PaymentMethod } from '../../../types';

/**
 * Returns a filtered (available) list of component Elements
 * @param components - Array of PaymentMethod objects from the /paymentMethods response
 * @param props - High level props to be passed through to every component (as defined in utils/getCommonProps)
 * @param create - Reference to the main instance `Core#create` method
 */
const createElements = (components: PaymentMethod[] = [], props, checkout) => {
    const elements = components
        .map(c => {
            // console.log('\n### createElements:::: c=', c);// TODO - keep for now, for debugging

            // OPT A: core generates props and initialises PM
            const pm = checkout.createUIElementForDropin(c, props);
            // console.log('### createElements:::: pm=', pm);// TODO - keep for now, for debugging
            return pm;
        })
        .filter(filterPresent)
        .filter(filterUnsupported);

    // filter available elements
    const elementPromises = elements.map(filterAvailable).map(p => p.catch(e => e));

    return Promise.all(elementPromises).then(values => elements.filter((el, i) => values[i] === true));
};

export default createElements;
