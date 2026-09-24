import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import type { PayPalVenmoButtonStyle, PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
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
                onSubmit,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, onSubmit, onError, presentationModeOptionsWithSandboxSupport]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions: presentationModeOptionsWithSandboxSupport,
                createSession: () => payPalSDKInstance.createVenmoSavePaymentSession(saveSessionOptions as PayPalVenmoSavePaymentSessionOptions),
                onSubmit,
                onError
            }),
            [payPalSDKInstance, saveSessionOptions, onSubmit, onError, presentationModeOptionsWithSandboxSupport]
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
