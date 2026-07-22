import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';

import { getUniqueId } from '../../../utils/idGenerator';
import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';

export const PayPalPayLaterButton = ({
    paypalService,
    commit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    onSubmit
}: Readonly<Omit<PayPalComponentV6Props, 'style'>>) => {
    const buttonId = useMemo(() => getUniqueId('paypal-paylater-button'), []);

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

    const { onClick } = usePayPalOneTimeSession({
        createSession: () => payPalSDKInstance.createPayLaterOneTimePaymentSession(oneTimeSessionOptions),
        createOrder
    });

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'paylater');

    useEffect(() => {
        if (!isEligible) return;

        const { productCode, countryCode } = paypalService.getEligiblePaymentMethods().getDetails('paylater');
        const button = document.querySelector(`#${buttonId}`);
        button?.setAttribute('productCode', productCode);
        button?.setAttribute('countryCode', countryCode);
    }, [isEligible, paypalService, buttonId]);

    if (!isEligible) {
        return null;
    }

    return <paypal-pay-later-button onclick={onClick} id={buttonId} />;
};
