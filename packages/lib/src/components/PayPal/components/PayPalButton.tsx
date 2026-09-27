import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { PayPalButtonStyle, PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useAmount } from '../../../core/Context/AmountProvider';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalSaveSession } from '../hooks/usePayPalSaveSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';

export const PayPalButton = ({
    paypalService,
    commit,
    vault,
    style,
    presentationModeOptions,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    onSubmit
}: Readonly<
    Omit<PayPalComponentV6Props, 'style' | 'setComponentRef'> & {
        style: PayPalButtonStyle;
    }
>) => {
    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);

    const { isZeroAuth } = useAmount();

    const { oneTimeSessionOptions, saveSessionOptions } = usePayPalSessionOptions({
        paypalService,
        commit,
        vault,
        onApprove,
        onShippingAddressChange,
        onShippingOptionsChange,
        onCancel,
        onError
    });

    const { onClick: oneTimePaymentClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayPalOneTimePaymentSession(oneTimeSessionOptions),
                onSubmit,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, onSubmit, onError, presentationModeOptions]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createPayPalSavePaymentSession(saveSessionOptions),
                onSubmit,
                onError
            }),
            [payPalSDKInstance, saveSessionOptions, onSubmit, onError, presentationModeOptions]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'paypal');

    if (!isEligible) {
        return null;
    }

    return (
        <paypal-button
            onclick={isZeroAuth ? savePaymentClick : oneTimePaymentClick}
            type={style.type}
            class={style.class}
            data-testid="paypal-button"
        />
    );
};
