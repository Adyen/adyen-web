import UIElement from '../../internal/UIElement';
import createElements from './createElements';
import type { PaymentMethod } from '../../../types/global-types';
import type { ICore } from '../../../core/types';
import type { PaymentMethodsConfiguration } from '../types';

/**
 *  Returns a filtered (available) list of InstantPaymentMethods Elements
 *
 * @param instantPaymentMethods - Array of PaymentMethod objects from the /paymentMethods response
 * @param paymentMethodsConfiguration - Dropin paymentMethodsConfiguration object
 * @param dropinProps - High level props to be passed through to every component
 * @param core - Reference to the checkout core object
 */
const createInstantPaymentElements = (
    instantPaymentMethods: PaymentMethod[] = [],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    dropinProps,
    core: ICore
): Promise<UIElement[]> => {
    if (instantPaymentMethods.length) {
        return createElements(instantPaymentMethods, paymentMethodsConfiguration, { ...dropinProps, isInstantPayment: true }, core);
    }
    return Promise.resolve([]);
};

export default createInstantPaymentElements;
