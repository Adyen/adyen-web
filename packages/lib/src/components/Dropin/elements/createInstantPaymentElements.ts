import createElements from './createElements';
import { PaymentMethod } from '../../../types';
import UIElement from '../../UIElement';
import Core from '../../../core';
import { PaymentMethodsConfiguration } from '../../../core/types';

// /**
//  *  Returns a filtered (available) list of InstantPaymentMethods Elements
//  * @param paymentMethods - Instant payment methods
//  * @param props - Props to be passed through to every paymentMethod
//  * @param create - Reference to the main instance `Core#create` method
//  */
const createInstantPaymentElements = (
    instantPaymentMethods: PaymentMethod[] = [],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    props,
    core: Core
): Promise<UIElement[]> | [] => {
    if (instantPaymentMethods.length) {
        return createElements(instantPaymentMethods, paymentMethodsConfiguration, { ...props, isInstantPayment: true, showPayButton: true }, core);
    }
    return [];
};

export default createInstantPaymentElements;
