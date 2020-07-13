import createElements from './createElements';
import { StoredPaymentMethod } from '../../../types';

/**
 *  Returns a filtered (available) list of oneClick paymentMethod Elements
 * @param paymentMethods -
 * @param props - Props to be passed through to every paymentMethod
 * @param paymentMethodsConfig - Specific config per payment method (where key is the name of the paymentMethod)
 */
const createStoredElements = (paymentMethods: StoredPaymentMethod[] = [], props, paymentMethodsConfig = {}) =>
    createElements(paymentMethods, { ...props, oneClick: true }, paymentMethodsConfig);

export default createStoredElements;
