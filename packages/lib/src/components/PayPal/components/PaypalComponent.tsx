import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import PaypalButtons from './PaypalButtons';
import Spinner from '../../internal/Spinner';
import { getPaypalUrl } from '../utils/get-paypal-url';
import Script from '../../../utils/Script';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type { PayPalComponentProps } from './types';

export default function PaypalComponent({ onApprove, onCancel, onChange, onError, onSubmit, onScriptLoadFailure, ...props }: PayPalComponentProps) {
    const [status, setStatus] = useState('pending');

    this.setStatus = setStatus;

    const handleOnApprove = useCallback(
        (data: any, actions: any) => {
            setStatus('processing');
            onApprove(data, actions);
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

        const script = new Script(src, 'body', attributes, dataAttributes);

        script.load().then(handlePaypalLoad).catch(handlePaypalLoadFailure);

        return () => {
            script.remove();
        };
    }, []);

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__paypal" aria-live="polite" aria-busy="true">
                <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--pending" data-testid={'paypal-loader'}>
                    <Spinner />
                </div>
            </div>
        );
    }

    return (
        <div className="adyen-checkout__paypal">
            <PaypalButtons
                {...props}
                onCancel={onCancel}
                onChange={onChange}
                onError={onError}
                onSubmit={onSubmit}
                onApprove={handleOnApprove}
                isProcessingPayment={status === 'processing'}
                paypalRef={window.paypal}
            />
        </div>
    );
}
