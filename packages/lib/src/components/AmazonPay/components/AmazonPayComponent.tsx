import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Spinner from '../../internal/Spinner';
import { getAmazonPayUrl } from '../utils';
import { AmazonPayComponentProps } from '../types';
import AmazonPayButton from './AmazonPayButton';
import ChangePaymentDetailsButton from './ChangePaymentDetailsButton';
import OrderButton from './OrderButton';
import SignOutButton from './SignOutButton';

export default function AmazonPayComponent(props: AmazonPayComponentProps) {
    const [status, setStatus] = useState('pending');

    const handleLoad = () => {
        setStatus('ready');
    };

    useEffect(() => {
        const script = document.createElement('script');
        const amazonPayUrl = getAmazonPayUrl(props.region);
        script.async = true;
        script.onload = handleLoad;
        script.src = amazonPayUrl;
        document.body.appendChild(script);
    }, []);

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__amazonpay">
                <div className="adyen-checkout__amazonpay__status adyen-checkout__amazonpay__status--pending">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (props.showSignOutButton) {
        return (
            <div className="adyen-checkout__amazonpay">
                <SignOutButton amazonRef={window.amazon} onSignOut={props.onSignOut} />
            </div>
        );
    }

    if (props.amazonCheckoutSessionId) {
        return (
            <div className="adyen-checkout__amazonpay">
                {props.showOrderButton && (
                    <OrderButton
                        amazonCheckoutSessionId={props.amazonCheckoutSessionId}
                        amount={props.amount}
                        clientKey={props.clientKey}
                        onError={props.onError}
                        returnUrl={props.returnUrl}
                    />
                )}

                {props.showChangePaymentDetailsButton && (
                    <ChangePaymentDetailsButton amazonCheckoutSessionId={props.amazonCheckoutSessionId} amazonRef={window.amazon} />
                )}
            </div>
        );
    }

    return (
        <div className="adyen-checkout__amazonpay">
            <AmazonPayButton {...props} amazonRef={window.amazon} />
        </div>
    );
}
