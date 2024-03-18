import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import Spinner from '../../internal/Spinner';
import { getAmazonPayUrl } from '../utils';
import { AmazonPayComponentProps } from '../types';
import AmazonPayButton from './AmazonPayButton';
import ChangePaymentDetailsButton from './ChangePaymentDetailsButton';
import OrderButton from './OrderButton';
import SignOutButton from './SignOutButton';
import Script from '../../../utils/Script';

export default function AmazonPayComponent(props: AmazonPayComponentProps) {
    const [status, setStatus] = useState('pending');
    const amazonPayButtonRef = useRef(null);
    const orderButtonRef = useRef(null);

    const handleLoad = () => {
        setStatus('ready');
    };

    this.getSubmitFunction = () => {
        if (amazonPayButtonRef.current && amazonPayButtonRef.current.initCheckout) return () => amazonPayButtonRef.current.initCheckout();
        if (orderButtonRef.current && orderButtonRef.current.createOrder) return () => orderButtonRef.current.createOrder();
    };

    useEffect(() => {
        const src = getAmazonPayUrl(props.configuration.region);
        const script = new Script(src);
        if (window.amazon) {
            handleLoad();
        } else {
            script.load().then(handleLoad);
        }

        return () => {
            script.remove();
        };
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
                        chargePermissionType={props.chargePermissionType}
                        recurringMetadata={props.recurringMetadata}
                        clientKey={props.clientKey}
                        onError={props.onError}
                        publicKeyId={props.configuration?.publicKeyId}
                        region={props.configuration?.region}
                        returnUrl={props.returnUrl}
                        ref={orderButtonRef}
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
            <AmazonPayButton {...props} showPayButton={this.props.showPayButton} amazonRef={window.amazon} ref={amazonPayButtonRef} />
        </div>
    );
}
