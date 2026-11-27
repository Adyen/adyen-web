import { h } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import type { PayPalVenmoButtonStyle, PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
import { usePayPalSaveSession } from '../hooks/usePayPalSaveSession';
import { useAmount } from '../../../core/Context/AmountProvider';
import { isLiveEnvironment } from '../../../utils/is-live-environment';
import type { PayPalVenmoSavePaymentSessionOptions } from '../paypal-js-types';

export const VenmoButton = ({
    paypalService,
    commit,
    style,
    vault,
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
    const fundingSource = 'venmo';
    const payPalSDKInstance = useMemo(() => paypalService.getInstance(), [paypalService]);

    const { isZeroAuth } = useAmount();

    const handleSubmit = useCallback(() => onSubmit(fundingSource), [onSubmit, fundingSource]);

    const { oneTimeSessionOptions, saveSessionOptions } = usePayPalSessionOptions({
        paypalService,
        commit,
        onApprove,
        onCancel,
        onError,
        vault
    });

    const isLive = isLiveEnvironment(environment);

    const sandboxSupport = useMemo(() => ({ enabled: !isLive }), [isLive]);

    const { onClick: oneTimePaymentClick } = usePayPalOneTimeSession(
        useMemo(
            () => ({
                sandboxSupport,
                createSession: () => payPalSDKInstance.createVenmoOneTimePaymentSession(oneTimeSessionOptions),
                onSubmit: handleSubmit,
                onError
            }),
            [payPalSDKInstance, oneTimeSessionOptions, handleSubmit, onError, sandboxSupport]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                sandboxSupport,
                createSession: () => payPalSDKInstance.createVenmoSavePaymentSession(saveSessionOptions as PayPalVenmoSavePaymentSessionOptions),
                onSubmit: handleSubmit,
                onError
            }),
            [payPalSDKInstance, saveSessionOptions, handleSubmit, onError, sandboxSupport]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, fundingSource);

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
