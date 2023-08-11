import { filterUnsupported, filterPresent, filterAvailable } from './filters';
import { PaymentMethod } from '../../../types';

/**
 * Returns a filtered (available) list of component Elements
 * @param components - Array of PaymentMethod objects from the /paymentMethods response
 * @param props - High level props to be passed through to every component (as defined in utils/getCommonProps)
 * @param create - Reference to the main instance `Core#create` method
 */
// const createElements = (components: PaymentMethod[] = [], props, create) => {
const createElements = (components: PaymentMethod[] = [], props, checkout) => {
    const elements = components
        .map(c => {
            console.log('\n### createElements:::: c=', c);
            // const pm = create(c, props);

            // OPT A: core generates props and initialises PM
            const pm = checkout.generateUIElementForDropin(c, props);
            console.log('### createElements:::: pm=', pm);
            return pm;

            // OPT B: core generates props, but we initialise the PM here
            // const PaymentMethod = checkout.getComponentFromRegistry(c.type);
            // const generatedProps = checkout.generateUIElementForDropin(c, props);
            // return new PaymentMethod(checkout, generatedProps);
        })
        .filter(filterPresent)
        .filter(filterUnsupported);

    // filter available elements
    const elementPromises = elements.map(filterAvailable).map(p => p.catch(e => e));

    return Promise.all(elementPromises).then(values => elements.filter((el, i) => values[i] === true));
};

export default createElements;
