import { h } from 'preact';

import type { PayPalVenmoButtonStyle } from '../types';
import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
import { useMemo } from 'preact/hooks';

export const VenmoButton = ({
    paypalService,
    commit,
    style,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    onSubmit
}: Readonly<
    Omit<PayPalComponentV6Props, 'style'> & {
        style: PayPalVenmoButtonStyle;
    }
>) => {
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
        createSession: () => payPalSDKInstance.createVenmoOneTimePaymentSession(oneTimeSessionOptions),
        createOrder
    });

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'venmo');

    if (!isEligible) {
        return null;
    }

    return <venmo-button onclick={onClick} type={style.type} class={style.class} />;
};
