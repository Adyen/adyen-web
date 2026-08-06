import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateVaultSetupToken } from '../hooks/useCreateVaultSetupToken';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
import { usePayPalSaveSession } from '../hooks/usePayPalSaveSession';
import { useAmount } from '../../../core/Context/AmountProvider';

export const PayPalCreditButton = ({
    paypalService,
    commit,
    vault,
    presentationModeOptions,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    onSubmit
}: Readonly<Omit<PayPalComponentV6Props, 'style' | 'setComponentRef'>>) => {
    const [countryCode, setCountryCode] = useState<string>('');

    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);

    const { isZeroAuth } = useAmount();

    const { oneTimeSessionOptions, saveSessionOptions } = usePayPalSessionOptions({
        paypalService,
        commit,
        onApprove,
        onShippingAddressChange,
        onShippingOptionsChange,
        onCancel,
        onError,
        vault
    });

    const createOrder = useCreateOrder(onSubmit);
    const createVaultSetupToken = useCreateVaultSetupToken(onSubmit);

    const { onClick: oneTimePaymentClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayPalCreditOneTimePaymentSession(oneTimeSessionOptions),
                createOrder
            }),
            [payPalSDKInstance, oneTimeSessionOptions, createOrder]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayPalCreditSavePaymentSession(saveSessionOptions),
                createVaultSetupToken
            }),
            [payPalSDKInstance, saveSessionOptions, createVaultSetupToken]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'credit');

    useEffect(() => {
        if (!isEligible) return;

        const details = paypalService.getEligiblePaymentMethods().getDetails('credit');
        setCountryCode(details?.countryCode);
    }, [isEligible, paypalService]);

    if (!isEligible) {
        return null;
    }

    return (
        <paypal-credit-button
            onclick={isZeroAuth ? savePaymentClick : oneTimePaymentClick}
            countryCode={countryCode}
            data-testid="paypal-credit-button"
        />
    );
};
