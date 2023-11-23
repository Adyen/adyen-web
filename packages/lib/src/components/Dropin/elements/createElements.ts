import { filterUnsupported, filterPresent, filterAvailable } from './filters';
import { PaymentMethod, StoredPaymentMethod } from '../../../types/global-types';
import { getComponentConfiguration } from './getComponentConfiguration';
import { ICore } from '../../../core/types';
import UIElement from '../../internal/UIElement/UIElement';
import { PaymentMethodsConfiguration } from '../types';

/**
 * Returns a filtered (available) list of component Elements
 *
 * @param paymentMethods - Array of PaymentMethod objects from the /paymentMethods response
 * @param paymentMethodsConfiguration - Dropin paymentMethodsConfiguration object
 * @param commonProps - High level props to be passed through to every component
 * @param core - Reference to the checkout core object
 */
const createElements = (
    paymentMethods: PaymentMethod[] | StoredPaymentMethod[],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    commonProps,
    core: ICore
): Promise<UIElement[]> => {
    const elements = paymentMethods
        .map(paymentMethod => {
            const paymentMethodConfigurationProps = getComponentConfiguration(
                paymentMethod.type,
                paymentMethodsConfiguration,
                paymentMethod.isStoredPaymentMethod
            );
            const PaymentMethodElement = core.getComponent(paymentMethod.type);

            if (!PaymentMethodElement) {
                console.warn(
                    `Dropin: '${paymentMethod.type}' component not found. Make sure to pass its Class to the Dropin 'paymentMethodComponents' parameter`
                );
                return null;
            }

            const elementProps = { core, ...paymentMethod, ...commonProps, ...paymentMethodConfigurationProps };

            return new PaymentMethodElement(elementProps);
        })
        .filter(filterPresent)
        .filter(filterUnsupported);

    return filterAvailable(elements);
};

export default createElements;
