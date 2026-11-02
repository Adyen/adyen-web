import { h } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
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
    const fundingSource = 'credit';
    const [countryCode, setCountryCode] = useState<string>('');

    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);

    const { isZeroAuth } = useAmount();

    const handleSubmit = useCallback(() => onSubmit(fundingSource), [onSubmit]);

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

    const { onClick: oneTimePaymentClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayPalCreditOneTimePaymentSession(oneTimeSessionOptions),
                onSubmit: handleSubmit,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, handleSubmit, onError, presentationModeOptions]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayPalCreditSavePaymentSession(saveSessionOptions),
                onSubmit: handleSubmit,
                onError
            }),
            [payPalSDKInstance, saveSessionOptions, handleSubmit, onError, presentationModeOptions]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, fundingSource);

    useEffect(() => {
        if (!isEligible) return;

        const details = paypalService.getEligiblePaymentMethods().getDetails(fundingSource);
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
