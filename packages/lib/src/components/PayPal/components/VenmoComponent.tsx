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
    setComponentRef,
    environment
}: Readonly<
    Omit<PayPalComponentV6Props, 'style' | 'onShippingAddressChange' | 'onShippingOptionsChange'> & {
        style?: PayPalVenmoButtonStyle;
    }
>) => {
    const { status, handleOnApprove } = usePayPalStatus({
        paypalService,
        onApprove,
        setComponentRef
    });

    if (status === 'pending') {
        return <PayPalSpinner />;
    }

    if (status === 'processing') {
        return <PayPalProcessingSpinner withoutReviewPage={commit} />;
    }

    return (
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
            environment={environment}
        />
    );
};
