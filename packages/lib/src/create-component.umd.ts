import { componentsMap, PaymentMethodOptions, PaymentMethods } from './components/types';
import { TxVariants } from './components/tx-variants';
import Redirect from './components/Redirect/Redirect';

/**
 * Helper function designed to be used internally by Adyen Plugins to create components
 *
 * WARNING: This function breaks tree-shaking as it import all Components to create the mapping. It must be used only with UMD bundle
 *
 * @param paymentType - Component payment type
 * @param options - Component configuration
 */
function createComponent<T extends keyof PaymentMethods>(paymentType: T, options: PaymentMethodOptions<T>): InstanceType<PaymentMethods[T]>;
function createComponent(paymentType: string, options: PaymentMethodOptions<TxVariants.redirect>): InstanceType<PaymentMethods['redirect']>;
function createComponent(paymentType: any, options: any): any {
    if (typeof paymentType !== 'string' || !paymentType) {
        throw Error('createComponent: Invalid payment type. Make sure to pass a string value');
    }

    if (paymentType === 'dropin') {
        throw Error('createComponent: Drop-in is not a payment type');
    }

    const Class = componentsMap[paymentType] || Redirect;

    return new Class({
        type: paymentType,
        ...options
    });
}

export default createComponent;
