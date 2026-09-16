import { h } from 'preact';

import { usePayPalStatus } from '../hooks/usePayPalStatus';
import { PayPalCreditButton } from './PayPalCreditButton';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { PayPalComponentV6Props } from './types';

export const PaypalCreditComponent = ({
    paypalService,
    commit = true,
    presentationModeOptions,
    vault,
    onSubmit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    setComponentRef
}: Readonly<
    Omit<PayPalComponentV6Props, 'style'> & {
        countryCode?: string;
    }
>) => {
    const { status, handleOnApprove } = usePayPalStatus({
        paypalService,
        onApprove,
        setComponentRef
    });

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
        <div className="adyen-checkout__paypal" data-testid="paypal-credit-component">
            <PayPalCreditButton
                paypalService={paypalService}
                presentationModeOptions={presentationModeOptions}
                commit={commit}
                vault={vault}
                onSubmit={onSubmit}
                onApprove={handleOnApprove}
                onError={onError}
                onCancel={onCancel}
                onShippingAddressChange={onShippingAddressChange}
                onShippingOptionsChange={onShippingOptionsChange}
            />
        </div>
    );
};
