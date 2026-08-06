import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { ComponentMethodsRef } from '../../types';
import { PayPalV6OnApproveData } from '../paypal-js-types';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { PayPalComponentV6Props } from './types';
import { PayPalMessaging } from './PayPalMessaging';

export const PayPalPaylaterComponent = ({
    paypalService,
    commit = true,
    presentationModeOptions,
    hidePayPalMessaging,
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
    const [status, setStatus] = useState('pending');

    const paypalPaylaterComponentRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        setComponentRef(paypalPaylaterComponentRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        paypalService
            .isSdkLoaded()
            .then(() => {
                setStatus('ready');
            })
            .catch(() => {
                // SDK failed to load, but we don't need to handle it here
            });
    }, [paypalService]);

    const handleOnApprove = useCallback(
        (data: PayPalV6OnApproveData) => {
            setStatus('processing');
            void onApprove(data);
            return Promise.resolve();
        },
        [onApprove]
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
        <div className="adyen-checkout__paypal" data-testid="paypal-paylater-component">
            {!hidePayPalMessaging && <PayPalMessaging paypalService={paypalService} />}
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
