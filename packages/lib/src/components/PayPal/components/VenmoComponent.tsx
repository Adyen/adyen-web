import { h } from 'preact';

import type { PayPalVenmoButtonStyle, PayPalComponentV6Props } from './types';
import { usePayPalStatus } from '../hooks/usePayPalStatus';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { VenmoButton } from './VenmoButton';

export const VenmoComponent = ({
    paypalService,
    commit = true,
    presentationModeOptions,
    vault,
    style,
    onSubmit,
    onApprove,
    onCancel,
    onError,
    setComponentRef
}: Readonly<
    Omit<PayPalComponentV6Props, 'style' | 'onShippingAddressChange' | 'onShippingOptionsChange'> & {
        countryCode?: string;
        style?: PayPalVenmoButtonStyle;
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
        <div className="adyen-checkout__paypal" data-testid="venmo-component">
            <VenmoButton
                paypalService={paypalService}
                presentationModeOptions={presentationModeOptions}
                commit={commit}
                vault={vault}
                onSubmit={onSubmit}
                onApprove={handleOnApprove}
                onError={onError}
                onCancel={onCancel}
                style={style ?? {}}
            />
        </div>
    );
};
