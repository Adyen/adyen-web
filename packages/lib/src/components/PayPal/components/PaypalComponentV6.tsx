import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import { usePayPalStatus } from '../hooks/usePayPalStatus';
import { PayPalButton } from './PayPalButton';
import { PayPalCreditButton } from './PayPalCreditButton';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { PayPalComponentV6Props } from './types';
import { VenmoButton } from './VenmoButton';

const PayPalComponentV6 = ({
    paypalService,
    style = {},
    commit = true,
    vault,
    blockPayPalCreditButton,
    blockPayPalPayLaterButton,
    blockPayPalVenmoButton,
    presentationModeOptions,
    onSubmit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    setComponentRef
}: Readonly<PayPalComponentV6Props>) => {
    const { status, handleOnApprove } = usePayPalStatus({
        paypalService,
        onApprove,
        setComponentRef
    });

    const commonProps = useMemo(
        () => ({
            paypalService,
            presentationModeOptions,
            commit,
            onSubmit,
            onApprove: handleOnApprove,
            onError,
            onCancel
        }),
        [paypalService, onSubmit, handleOnApprove, onError, onShippingAddressChange, onShippingOptionsChange, onCancel, commit]
    );

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__paypal" aria-live="polite" aria-busy="true">
                <PayPalSpinner />
            </div>
        );
    }

    if (status === 'processing') {
        return (
            <div className="adyen-checkout__paypal" aria-live="polite" aria-busy="true">
                <PayPalProcessingSpinner withoutReviewPage={commit} />
            </div>
        );
    }

    return (
        <div className="adyen-checkout__paypal" data-testid="paypal-component">
            <PayPalButton
                {...commonProps}
                style={style.paypal ?? {}}
                vault={vault}
                onShippingAddressChange={onShippingAddressChange}
                onShippingOptionsChange={onShippingOptionsChange}
            />
            {!blockPayPalPayLaterButton && (
                <PayPalPayLaterButton
                    {...commonProps}
                    onShippingAddressChange={onShippingAddressChange}
                    onShippingOptionsChange={onShippingOptionsChange}
                />
            )}
            {!blockPayPalCreditButton && (
                <PayPalCreditButton
                    {...commonProps}
                    vault={vault}
                    onShippingAddressChange={onShippingAddressChange}
                    onShippingOptionsChange={onShippingOptionsChange}
                />
            )}
            {!blockPayPalVenmoButton && <VenmoButton {...commonProps} style={style.venmo ?? {}} vault={vault} />}
        </div>
    );
};

export { PayPalComponentV6 };
