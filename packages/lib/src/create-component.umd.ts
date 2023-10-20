import { componentsMap, PaymentMethodOptions, PaymentMethods } from './components/types';
import { TxVariants } from './components/tx-variants';
import Redirect from './components/Redirect/Redirect';

/**
 * Helper function designed to be used internally by Adyen Plugins to create components
 *
 * WARNING: This function breaks tree-shaking as it import all Components to create the mapping. It must be used only with UMD bundle
 *
 * @param txVariant - Component txVariant
 * @param options - Component configuration
 */
function createComponentFromTxVariant<T extends keyof PaymentMethods>(
    txVariant: T,
    options: PaymentMethodOptions<T>
): InstanceType<PaymentMethods[T]>;
function createComponentFromTxVariant(
    txVariant: string,
    options: PaymentMethodOptions<TxVariants.redirect>
): InstanceType<PaymentMethods['redirect']>;
function createComponentFromTxVariant(txVariant: any, options: any): any {
    if (typeof txVariant !== 'string' || !txVariant) {
        throw Error('createComponentFromTxVariant: Invalid txVariant');
    }

    if (txVariant === 'dropin') {
        throw Error('createComponentFromTxVariant: Drop-in is not a txVariant');
    }

    const Class = componentsMap[txVariant] || Redirect;

    return new Class({
        type: txVariant,
        ...options
    });
}

export default createComponentFromTxVariant;
