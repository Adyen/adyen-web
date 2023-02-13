import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import PaypalButtons from './PaypalButtons';
import Spinner from '../../internal/Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';
import { getPaypalUrl } from '../utils';
import { PayPalComponentProps } from '../types';
import Script from '../../../utils/Script';

export default function PaypalComponent({ onApprove, onCancel, onChange, onError, onSubmit, ...props }: PayPalComponentProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('pending');

    this.setStatus = setStatus;

    // const handleComplete = (data, orderData) => {
    //     setStatus('processing');
    //     onApprove(data, orderData);
    // };

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

    if (status === 'processing') {
        return (
            <div className="adyen-checkout__paypal">
                <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--processing">
                    <Spinner size="medium" inline /> {i18n.get('paypal.processingPayment')}
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
                onApprove={onApprove}
                paypalRef={window.paypal}
            />
        </div>
    );
}
