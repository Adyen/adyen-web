import { h } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

import PaypalButtons from './PaypalButtons';
import Spinner from '../../internal/Spinner';
import { getPaypalUrl } from '../utils/get-paypal-url';
import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type { PayPalComponentProps } from './types';
import useAnalytics from '../../../core/Analytics/useAnalytics';
import { ComponentMethodsRef } from '../../types';
import type { PayPalOnApproveActions, PayPalOnApproveData } from '../paypal-js-types';

export default function PaypalComponent({
    onApprove,
    onCancel,
    onError,
    onSubmit,
    onScriptLoadFailure,
    setComponentRef,
    ...props
}: Readonly<PayPalComponentProps>) {
    const [status, setStatus] = useState('pending');
    const { analytics } = useAnalytics();

    const paypalComponentRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        setComponentRef(paypalComponentRef.current);
    }, [setComponentRef]);

    const handleOnApprove = useCallback(
        (data: PayPalOnApproveData, actions: PayPalOnApproveActions) => {
            setStatus('processing');
            // Awaiting this callback delays closing of the PayPal popup or closing the redirect page
            // after the payment has been approved
            void onApprove(data, actions);
            return Promise.resolve();
        },
        [onApprove]
    );

    const handlePaypalLoad = () => {
        setStatus('ready');
    };

    const handlePaypalLoadFailure = (error: AdyenCheckoutError) => {
        onScriptLoadFailure(error);
    };

    useEffect(() => {
        const src = getPaypalUrl(props);

        const attributes = { ...(props.cspNonce && { nonce: props.cspNonce }) },
            dataAttributes = { ...(props.cspNonce && { cspNonce: props.cspNonce }) };

        const script = new Script({
            src,
            component: 'paypal',
            attributes,
            dataAttributes,
            analytics
        });

        script.load().then(handlePaypalLoad).catch(handlePaypalLoadFailure);

        return () => {
            script.remove();
        };
    }, []);

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
            <PaypalButtons
                {...props}
                onCancel={onCancel}
                onError={onError}
                onSubmit={onSubmit}
                onApprove={handleOnApprove}
                isProcessingPayment={status === 'processing'}
                paypalRef={window.paypal}
            />
        </div>
    );
}
