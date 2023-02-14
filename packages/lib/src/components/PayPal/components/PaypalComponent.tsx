import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import PaypalButtons from './PaypalButtons';
import Spinner from '../../internal/Spinner';
import { getPaypalUrl } from '../utils';
import { PayPalComponentProps } from '../types';
import Script from '../../../utils/Script';

export default function PaypalComponent({ onApprove, onCancel, onChange, onError, onSubmit, ...props }: PayPalComponentProps) {
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

    useEffect(() => {
        const src = getPaypalUrl(props);

        const attributes = { ...(props.cspNonce && { nonce: props.cspNonce }) },
            dataAttributes = { ...(props.cspNonce && { cspNonce: props.cspNonce }) };

        const script = new Script(src, 'body', attributes, dataAttributes);

        script.load().then(handlePaypalLoad);

        return () => {
            script.remove();
        };
    }, []);

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__paypal">
                <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--pending">
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
