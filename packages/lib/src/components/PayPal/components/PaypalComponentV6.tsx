import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { PayPalComponentV6Props } from './types';
import { PayPalButton } from './PayPalButton';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalCreditButton } from './PayPalCreditButton';
import { VenmoButton } from './VenmoButton';
import { PayPalSpinner } from './PayPalSpinner';
import { ComponentMethodsRef } from '../../types';
import { PayPalV6OnApproveData } from '../paypal-js-types';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';

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
    const [status, setStatus] = useState('pending');

    const paypalComponentRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        setComponentRef(paypalComponentRef.current);
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
                <PayPalProcessingSpinner withReviewPage={commit} />
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
