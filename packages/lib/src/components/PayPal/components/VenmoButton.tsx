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
import { DEFAULT_PAYMENT_SESSION_OPTIONS } from '../config';
import { isLiveEnvironment } from '../../../utils/is-live-environment';
import type { PayPalPresentationModeOptions, PayPalVenmoSavePaymentSessionOptions } from '../paypal-js-types';

export const VenmoButton = ({
    paypalService,
    commit,
    style,
    vault,
    presentationModeOptions,
    onApprove,
    onCancel,
    onError,
    onSubmit,
    environment
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

    const isLive = isLiveEnvironment(environment);

    const presentationModeOptionsWithSandboxSupport = useMemo<PayPalPresentationModeOptions>(
        () => ({
            ...(presentationModeOptions ?? DEFAULT_PAYMENT_SESSION_OPTIONS),
            sandboxSupport: {
                enabled: !isLive
            }
        }),
        [presentationModeOptions, isLive]
    );

    const { onClick: oneTimePaymentClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                presentationModeOptions: presentationModeOptionsWithSandboxSupport,
                createSession: () => payPalSDKInstance.createVenmoOneTimePaymentSession(oneTimeSessionOptions),
                createOrder,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, createOrder, onError, presentationModeOptionsWithSandboxSupport]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions: presentationModeOptionsWithSandboxSupport,
                createSession: () => payPalSDKInstance.createVenmoSavePaymentSession(saveSessionOptions as PayPalVenmoSavePaymentSessionOptions),
                createVaultSetupToken,
                onError
            }),
            [payPalSDKInstance, saveSessionOptions, createVaultSetupToken, onError, presentationModeOptionsWithSandboxSupport]
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
