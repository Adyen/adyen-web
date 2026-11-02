import { h } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';

export const PayPalPayLaterButton = ({
    paypalService,
    commit,
    presentationModeOptions,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    onSubmit
}: Readonly<Omit<PayPalComponentV6Props, 'style' | 'setComponentRef'>>) => {
    const fundingSource = 'paylater';
    const [countryCode, setCountryCode] = useState<string>('');
    const [productCode, setProductCode] = useState<string>('');

    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);

    const { oneTimeSessionOptions } = usePayPalSessionOptions({
        paypalService,
        commit,
        onApprove,
        onShippingAddressChange,
        onShippingOptionsChange,
        onCancel,
        onError
    });

    const handleSubmit = useCallback(() => onSubmit(fundingSource), [onSubmit]);

    const { onClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayLaterOneTimePaymentSession(oneTimeSessionOptions),
                onSubmit: handleSubmit,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, handleSubmit, onError, presentationModeOptions]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, fundingSource);

    useEffect(() => {
        if (!isEligible) return;

        const details = paypalService.getEligiblePaymentMethods().getDetails(fundingSource);
        setProductCode(details?.productCode);
        setCountryCode(details?.countryCode);
    }, [isEligible, paypalService]);

    if (!isEligible) {
        return null;
    }

    return <paypal-pay-later-button onclick={onClick} productCode={productCode} countryCode={countryCode} data-testid="paypal-paylater-button" />;
};
