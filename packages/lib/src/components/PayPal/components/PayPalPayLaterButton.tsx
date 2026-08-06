import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateOrder } from '../hooks/useCreateOrder';
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

    const createOrder = useCreateOrder(onSubmit);

    const { onClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayLaterOneTimePaymentSession(oneTimeSessionOptions),
                createOrder
            }),
            [payPalSDKInstance, oneTimeSessionOptions, createOrder]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'paylater');

    useEffect(() => {
        if (!isEligible) return;

        const details = paypalService.getEligiblePaymentMethods().getDetails('paylater');
        setProductCode(details?.productCode);
        setCountryCode(details?.countryCode);
    }, [isEligible, paypalService]);

    if (!isEligible) {
        return null;
    }

    return <paypal-pay-later-button onclick={onClick} productCode={productCode} countryCode={countryCode} data-testid="paypal-paylater-button" />;
};
