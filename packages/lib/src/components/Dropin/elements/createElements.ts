import { filterUnsupported, filterPresent, filterAvailable } from './filters';
import { PaymentMethod } from '../../../types';
// import UIElement from '../../UIElement';
import Core from '../../../core';
import { PaymentMethodsConfiguration } from '../../../core/types';
//
// /**
//  * Returns a filtered (available) list of component Elements
//  * @param components - Array of PaymentMethod objects from the /paymentMethods response
//  * @param props - High level props to be passed through to every component (as defined in utils/getCommonProps)
//  * @param create - Reference to the main instance `Core#create` method
//  */
const createElements = (paymentMethods: PaymentMethod[], paymentMethodsConfiguration: PaymentMethodsConfiguration, props, core: Core) => {
    const elements = paymentMethods
        .map(paymentMethod => {
            const props = paymentMethodsConfiguration[paymentMethod.type] || {};
            const PaymentMethodElement = core.getComponent(paymentMethod.type);

            if (!PaymentMethodElement) {
                console.warn(
                    `Drop-in: The component of '${paymentMethod.type}' is unavailable. Make sure to pass its Object to Drop-in 'paymentMethods' property`
                );
                return null;
            }

            return new PaymentMethodElement({ core, ...props });
        })
        .filter(filterPresent)
        .filter(filterUnsupported);

    // filter available elements
    const elementPromises = elements.map(filterAvailable).map(p => p.catch(e => e));

    return Promise.all(elementPromises).then(values => elements.filter((el, i) => values[i] === true));
};

export default createElements;
