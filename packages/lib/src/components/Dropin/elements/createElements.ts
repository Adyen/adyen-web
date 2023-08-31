import { filterUnsupported, filterPresent, filterAvailable } from './filters';
import { PaymentMethod, StoredPaymentMethod } from '../../../types';
import { ICore } from '../../../core/core';
import { PaymentMethodsConfiguration } from '../../../core/types';
import { getComponentConfiguration } from '../../../core/utils';
//
// /**
//  * Returns a filtered (available) list of component Elements
//  * @param components - Array of PaymentMethod objects from the /paymentMethods response
//  * @param props - High level props to be passed through to every component (as defined in utils/getCommonProps)
//  * @param create - Reference to the main instance `Core#create` method
//  */
const createElements = (
    paymentMethods: PaymentMethod[] | StoredPaymentMethod[],
    paymentMethodsConfiguration: PaymentMethodsConfiguration,
    commonProps,
    core: ICore
) => {
    const elements = paymentMethods
        .map(paymentMethod => {
            const paymentMethodConfigurationProps = getComponentConfiguration(
                paymentMethod.type,
                paymentMethodsConfiguration,
                paymentMethod.storedPaymentMethodId
            );
            const PaymentMethodElement = core.getComponent(paymentMethod.type);

            if (!PaymentMethodElement) {
                console.warn(`The component of '${paymentMethod.type}' is unavailable. Make sure to register its Class before creating the Drop-in.`);
                return null;
            }

            const elementProps = { core, ...paymentMethod, ...commonProps, ...paymentMethodConfigurationProps };

            // core.updatePaymentMethodsConfiguration({ [paymentMethod.type]: paymentMethodConfigurationProps });
            return new PaymentMethodElement(elementProps);
        })
        .filter(filterPresent)
        .filter(filterUnsupported);

    // filter available elements
    const elementPromises = elements.map(filterAvailable).map(p => p.catch(e => e));

    return Promise.all(elementPromises).then(values => elements.filter((el, i) => values[i] === true));
};

export default createElements;
