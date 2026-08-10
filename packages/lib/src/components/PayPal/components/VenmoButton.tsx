import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { PayPalVenmoButtonStyle, PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
import { useCreateVaultSetupToken } from '../hooks/useCreateVaultSetupToken';
import { usePayPalSaveSession } from '../hooks/usePayPalSaveSession';
import { useAmount } from '../../../core/Context/AmountProvider';
import { PayPalVenmoSavePaymentSessionOptions } from '../paypal-js-types';

export const VenmoButton = ({
    paypalService,
    commit,
    style,
    vault,
    presentationModeOptions,
    onApprove,
    onCancel,
    onError,
    onSubmit
}: Readonly<
    Omit<PayPalComponentV6Props, 'style' | 'setComponentRef'> & {
        style: PayPalVenmoButtonStyle;
    }
>) => {
    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);

    const { isZeroAuth } = useAmount();

    const { oneTimeSessionOptions, saveSessionOptions } = usePayPalSessionOptions({
        paypalService,
        commit,
        onApprove,
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
                createSession: () => payPalSDKInstance.createVenmoOneTimePaymentSession(oneTimeSessionOptions),
                createOrder,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, createOrder]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions,
                createSession: () => payPalSDKInstance.createVenmoSavePaymentSession(saveSessionOptions as PayPalVenmoSavePaymentSessionOptions),
                createVaultSetupToken,
                onError
            }),
            [payPalSDKInstance, saveSessionOptions, createVaultSetupToken]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'venmo');

    if (!isEligible) {
        return null;
    }

    return (
        <venmo-button
            onclick={isZeroAuth ? savePaymentClick : oneTimePaymentClick}
            type={style?.type}
            class={style?.class}
            data-testid="venmo-button"
        />
    );
};
