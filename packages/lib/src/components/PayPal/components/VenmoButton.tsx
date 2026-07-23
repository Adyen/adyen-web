import { h } from 'preact';

import type { PayPalVenmoButtonStyle } from '../types';
import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
import { useMemo } from 'preact/hooks';
import { useCreateVaultSetupToken } from '../hooks/useCreateVaultSetupToken';
import { usePayPalSaveSession } from '../hooks/usePayPalSaveSession';
import { useAmount } from '../../../core/Context/AmountProvider';

export const VenmoButton = ({
    paypalService,
    commit,
    style,
    vault,
    presentationModeOptions,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
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
        onShippingAddressChange,
        onShippingOptionsChange,
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
                createOrder
            }),
            [payPalSDKInstance, oneTimeSessionOptions, createOrder]
        )
    );

    const { onClick: savePaymentClick } = usePayPalSaveSession(
        useMemo(
            () => ({
                presentationModeOptions,
                // @ts-expect-error - createVenmoSavePaymentSession is not in the type definition but exists in the SDK
                createSession: () => payPalSDKInstance.createVenmoSavePaymentSession(saveSessionOptions),
                createVaultSetupToken
            }),
            [payPalSDKInstance, saveSessionOptions, createVaultSetupToken]
        )
    );

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'venmo');

    if (!isEligible) {
        return null;
    }

    return <venmo-button onclick={isZeroAuth ? savePaymentClick : oneTimePaymentClick} type={style.type} class={style.class} />;
};
