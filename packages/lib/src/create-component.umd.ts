import { TxVariants } from './components/tx-variants';
import Redirect from './components/Redirect/Redirect';
import { ComponentsMap } from './components/components-map';
import type { PaymentMethodOptions, PaymentMethods } from './components/Dropin/types';
import type { ICore } from './core/types';

/**
 * Helper function designed to be used internally by Adyen Plugins to create components
 *
 * WARNING: This function breaks tree-shaking as it import all Components to create the mapping. It must be used only with UMD bundle
 *
 * @param paymentType - Component payment type
 * @param checkout - Instance of AdyenCheckout
 * @param options - Component configuration
 */
function createComponent<T extends keyof PaymentMethods>(
    paymentType: T,
    checkout: ICore,
    options?: PaymentMethodOptions<T>
): InstanceType<PaymentMethods[T]>;
function createComponent(
    paymentType: string,
    checkout: ICore,
    options?: PaymentMethodOptions<TxVariants.redirect>
): InstanceType<PaymentMethods['redirect']>;
function createComponent(paymentType: any, checkout: ICore, options?: any): any {
    if (typeof paymentType !== 'string' || !paymentType) {
        throw Error('createComponent: Invalid payment type. Make sure to pass a string value');
    }

    if (paymentType === 'dropin') {
        throw Error('createComponent: Drop-in is not a payment type');
    }

    const Class = ComponentsMap[paymentType] || Redirect;

    return new Class({
        type: paymentType,
        ...options
    });
}

export default createComponent;
