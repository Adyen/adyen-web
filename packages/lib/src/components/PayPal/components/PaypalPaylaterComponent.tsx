import { h } from 'preact';

import { usePayPalStatus } from '../hooks/usePayPalStatus';
import { PayPalMessaging } from './PayPalMessaging';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { PayPalComponentV6Props } from './types';

export const PayPalPaylaterComponent = ({
    paypalService,
    commit = true,
    presentationModeOptions,
    hidePayPalMessaging,
    countryCode,
    onSubmit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    setComponentRef
}: Readonly<
    Omit<PayPalComponentV6Props, 'style' | 'vault'> & {
        hidePayPalMessaging?: boolean;
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
        <div className="adyen-checkout__paypal" data-testid="paypal-paylater-component">
            {!hidePayPalMessaging && <PayPalMessaging paypalService={paypalService} countryCode={countryCode} />}
            <PayPalPayLaterButton
                paypalService={paypalService}
                presentationModeOptions={presentationModeOptions}
                commit={commit}
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
