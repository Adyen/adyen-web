import createElements from './createElements';
import { StoredPaymentMethod } from '../../../types';
import { PaymentMethodsConfiguration } from '../../../core/types';
import Core from '../../../core';

// /**
//  *  Returns a filtered (available) list of oneClick paymentMethod Elements
//  * @param paymentMethods -
//  * @param props - Props to be passed through to every paymentMethod
//  * @param create - Reference to the main instance `create` method
//  */
const createStoredElements = (
    paymentMethods: StoredPaymentMethod[] = [],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    props,
    core: Core
) => createElements(paymentMethods, paymentMethodsConfiguration, { ...props, oneClick: true }, core);

export default createStoredElements;
