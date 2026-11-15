import { useMemo } from 'preact/hooks';
import { PayPalV6OneTimePaymentSessionOptions, PayPalSavePaymentSessionOptions } from '../paypal-js-types';
import { PayPalComponentV6Props } from '../components/types';

export const usePayPalSessionOptions = ({
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    commit,
    vault
}: Omit<PayPalComponentV6Props, 'onSubmit' | 'style' | 'setComponentRef'>) => {
    const oneTimeSessionOptions: PayPalV6OneTimePaymentSessionOptions = useMemo(
        () => ({
            onApprove,
            onShippingAddressChange,
            onShippingOptionsChange,
            onCancel,
            onError,
            commit,
            savePayment: vault
        }),
        [onApprove, onShippingAddressChange, onShippingOptionsChange, onCancel, onError, commit, vault]
    );

    const saveSessionOptions: PayPalSavePaymentSessionOptions = useMemo(
        () => ({
            onApprove,
            onCancel,
            onError
        }),
        [onApprove, onCancel, onError]
    );

    return {
        oneTimeSessionOptions,
        saveSessionOptions
    };
};
