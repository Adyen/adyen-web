import { filterUnsupported, filterPresent, filterAvailable, optionallyFilterUpiSubTxVariants } from './filters';
import { getComponentConfiguration } from './getComponentConfiguration';
import getComponentNameOfPaymentType from '../../components-name-map';
import UIElement from '../../internal/UIElement';
import type { PaymentMethod, StoredPaymentMethod } from '../../../types/global-types';
import type { PaymentMethodsConfiguration } from '../types';
import type { ICore } from '../../../core/types';

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
    const elements = optionallyFilterUpiSubTxVariants(paymentMethods)
        .map(paymentMethod => {
            const isStoredPaymentMethod = 'isStoredPaymentMethod' in paymentMethod && paymentMethod.isStoredPaymentMethod;
            const paymentMethodConfigurationProps = getComponentConfiguration(paymentMethod.type, paymentMethodsConfiguration, isStoredPaymentMethod);
            const PaymentMethodElement = core.getComponent(paymentMethod.type);

            if (!PaymentMethodElement) {
                console.warn(
                    `\nDropin: You support the payment method '${
                        paymentMethod.type
                    }' but this component has not been configured. Make sure to import the Class  '${getComponentNameOfPaymentType(
                        paymentMethod.type
                    )}' and then pass it in the Dropin's 'paymentMethodComponents' config property if you wish to offer this payment method.`
                );
                return null;
            }

            const elementProps = { ...paymentMethod, ...commonProps, ...paymentMethodConfigurationProps };

            return new PaymentMethodElement(core, elementProps);
        })
        .filter(filterPresent)
        .filter(filterUnsupported);

    return filterAvailable(elements);
};

export default createElements;
