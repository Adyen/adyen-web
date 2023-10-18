import createElements from './createElements';
import { PaymentMethod } from '../../../types';
import UIElement from '../../UIElement';
import { PaymentMethodsConfiguration } from '../../types';
import { ICore } from '../../../core/types';

/**
 *  Returns a filtered (available) list of InstantPaymentMethods Elements
 *
 * @param instantPaymentMethods - Array of PaymentMethod objects from the /paymentMethods response
 * @param paymentMethodsConfiguration - Dropin paymentMethodsConfiguration object
 * @param commonProps - High level props to be passed through to every component
 * @param core - Reference to the checkout core object
 */
const createInstantPaymentElements = (
    instantPaymentMethods: PaymentMethod[] = [],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    commonProps,
    core: ICore
): Promise<UIElement[]> => {
    if (instantPaymentMethods.length) {
        return createElements(
            instantPaymentMethods,
            paymentMethodsConfiguration,
            { ...commonProps, isInstantPayment: true, showPayButton: true },
            core
        );
    }
    return Promise.resolve([]);
};

export default createInstantPaymentElements;
