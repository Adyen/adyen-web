import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import { PayPalComponentV6Props } from './types';
import { PayPalButton } from './PayPalButton';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalCreditButton } from './PayPalCreditButton';
import { VenmoButton } from './VenmoButton';
import { ComponentMethodsRef } from '../../types';
import Spinner from '../../internal/Spinner';

const PayPalComponentV6 = ({
    paypalService,
    style,
    commit,
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

    const commonProps = useMemo(
        () => ({
            paypalService,
            presentationModeOptions,
            commit,
            onSubmit,
            onApprove,
            onError,
            onShippingAddressChange,
            onShippingOptionsChange,
            onCancel
        }),
        [paypalService, onSubmit, onApprove, onError, onShippingAddressChange, onShippingOptionsChange, onCancel, commit]
    );

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__paypal" aria-live="polite" aria-busy="true">
                <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--pending" data-testid="paypal-loader">
                    <Spinner />
                </div>
            </div>
        );
    }

    return (
        <div className="adyen-checkout__paypal" data-testid="paypal-component">
            <PayPalButton {...commonProps} style={style.paypal} vault={vault} />
            {!blockPayPalPayLaterButton && <PayPalPayLaterButton {...commonProps} />}
            {!blockPayPalCreditButton && <PayPalCreditButton {...commonProps} vault={vault} />}
            {!blockPayPalVenmoButton && <VenmoButton {...commonProps} style={style.venmo} onCancel={onCancel} vault={vault} />}
        </div>
    );
};

export { PayPalComponentV6 };
