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
import useAnalytics from '../../../core/Analytics/useAnalytics';

export default function AmazonPayComponent(props: Readonly<AmazonPayComponentProps>) {
    const [status, setStatus] = useState('pending');
    const amazonPayButtonRef = useRef(null);
    const orderButtonRef = useRef(null);
    const { analytics } = useAnalytics();

    const handleLoad = () => {
        setStatus('ready');
    };

    const amazonPayRef = useRef({
        getSubmitFunction: () => {
            if (amazonPayButtonRef.current?.initCheckout) return () => amazonPayButtonRef.current.initCheckout();
            if (orderButtonRef.current?.createOrder) return () => orderButtonRef.current.createOrder();
            return null;
        }
    });

    useEffect(() => {
        props.setComponentRef(amazonPayRef.current);
    }, [props.setComponentRef]);

    useEffect(() => {
        const src = getAmazonPayUrl(props.configuration.region);
        const script = new Script({
            src,
            component: 'amazonpay',
            analytics
        });

        if (window.amazon) {
            handleLoad();
        } else {
            void script.load().then(handleLoad);
        }

        return () => {
            script.remove();
        };
    }, [analytics]);

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
            <AmazonPayButton
                showPayButton={props.showPayButton}
                amazonRef={window.amazon}
                ref={amazonPayButtonRef}
                buttonColor={props.buttonColor}
                cancelUrl={props.cancelUrl}
                chargePermissionType={props.chargePermissionType}
                onClick={props.onClick}
                onError={props.onError}
                clientKey={props.clientKey}
                configuration={props.configuration}
                currency={props.currency}
                deliverySpecifications={props.deliverySpecifications}
                design={props.design}
                environment={props.environment}
                locale={props.locale}
                placement={props.placement}
                productType={props.productType}
                recurringMetadata={props.recurringMetadata}
                returnUrl={props.returnUrl}
            />
        </div>
    );
}
