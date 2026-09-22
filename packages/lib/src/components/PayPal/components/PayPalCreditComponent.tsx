import { h } from 'preact';

import { usePayPalStatus } from '../hooks/usePayPalStatus';
import { PayPalCreditButton } from './PayPalCreditButton';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { PayPalComponentV6Props } from './types';

export const PayPalCreditComponent = ({
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
}: Readonly<Omit<PayPalComponentV6Props, 'style'>>) => {
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
    );
};
