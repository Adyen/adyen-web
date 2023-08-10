import createElements from './createElements';
import { StoredPaymentMethod } from '../../../types';

/**
 *  Returns a filtered (available) list of oneClick paymentMethod Elements
 * @param paymentMethods -
 * @param props - Props to be passed through to every paymentMethod
 * @param create - Reference to the main instance `create` method
 */
// const createStoredElements = (paymentMethods: StoredPaymentMethod[] = [], props, create) =>
//     createElements(paymentMethods, { ...props, oneClick: true }, create);
const createStoredElements = (paymentMethods: StoredPaymentMethod[] = [], props, checkout) =>
    createElements(paymentMethods, { ...props, oneClick: true }, checkout);

export default createStoredElements;
