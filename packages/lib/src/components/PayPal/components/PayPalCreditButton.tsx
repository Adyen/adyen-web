import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';

import { getUniqueId } from '../../../utils/idGenerator';
import type { PayPalComponentV6Props } from './types';
import { usePayPalSessionOptions } from '../hooks/usePayPalSessionOptions';
import { useCreateVaultSetupToken } from '../hooks/useCreateVaultSetupToken';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePayPalOneTimeSession } from '../hooks/usePayPalOneTimeSession';
import { usePayPalButtonEligibility } from '../hooks/usePayPalButtonEligibility';
import { usePayPalSaveSession } from '../hooks/usePayPalSaveSession';
import { useAmount } from '../../../core/Context/AmountProvider';

export const PayPalCreditButton = ({
    paypalService,
    commit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    onSubmit,
    vault
}: Readonly<Omit<PayPalComponentV6Props, 'style'>>) => {
    const buttonId = useMemo(() => getUniqueId('paypal-credit-button'), []);

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

    const { onClick: oneTimePaymentClick } = usePayPalOneTimeSession({
        createSession: () => payPalSDKInstance.createPayPalCreditOneTimePaymentSession(oneTimeSessionOptions),
        createOrder
    });

    const { onClick: savePaymentClick } = usePayPalSaveSession({
        createSession: () => payPalSDKInstance.createPayPalCreditSavePaymentSession(saveSessionOptions),
        createVaultSetupToken
    });

    const { isEligible } = usePayPalButtonEligibility(paypalService, 'credit');

    useEffect(() => {
        if (!isEligible) return;

        const { countryCode } = paypalService.getEligiblePaymentMethods().getDetails('credit');
        const button = document.querySelector(`#${buttonId}`);
        button?.setAttribute('countryCode', countryCode);
    }, [isEligible, paypalService, buttonId]);

    if (!isEligible) {
        return null;
    }

    return <paypal-credit-button onclick={isZeroAuth ? savePaymentClick : oneTimePaymentClick} id={buttonId} />;
};
