import Script from '../../../../utils/Script';
import { useEffect, useRef, useState } from 'preact/hooks';
import { h } from 'preact';
import { KlarnaWidgetAuthorizeResponse, KlarnaWidgetProps } from '../../types';
import { KLARNA_WIDGET_URL } from '../../constants';
import './KlarnaWidget.scss';

export function KlarnaWidget({ sdkData, paymentMethodType, payButton, ...props }: KlarnaWidgetProps) {
    const klarnaWidgetRef = useRef(null);
    const [status, setStatus] = useState('ready');

    const handleError = () => {
        setStatus('error');
        props.onComplete({
            data: {
                paymentData: props.paymentData,
                details: {}
            }
        });
    };

    const initializeKlarnaWidget = () => {
        window.Klarna.Payments.init({
            client_token: sdkData.client_token
        });

        window.Klarna.Payments.load(
            {
                container: klarnaWidgetRef.current,
                payment_method_category: sdkData.payment_method_category
            },
            function (res) {
                // If show_form: true is received together with an error, something fixable is wrong and the consumer
                // needs to take action before moving forward
                // If show_form: false, the payment method in the loaded widget will not be offered for this order
                // based on Klarna’s pre-assessment.
                if (!res.show_form || !!res.error) {
                    handleError();
                } else {
                    props.onLoaded();
                }
            }
        );
    };

    const authorizeKlarna = () => {
        setStatus('loading');
        try {
            window.Klarna.Payments.authorize(
                {
                    payment_method_category: sdkData.payment_method_category
                },
                function (res: KlarnaWidgetAuthorizeResponse) {
                    if (res.approved === true && res.show_form === true) {
                        // Klarna has approved the authorization of credit for this order.
                        setStatus('success');
                        props.onComplete({
                            data: {
                                paymentData: props.paymentData,
                                details: {
                                    authorization_token: res.authorization_token
                                }
                            }
                        });
                    } else if (!res.approved && res.show_form === true) {
                        // Fixable error
                        setStatus('ready');
                        props.onError(res);
                    } else {
                        // The purchase is declined. The widget should be hidden and the user
                        // should select another payment method.
                        handleError();
                    }
                }
            );
        } catch (e) {
            handleError();
        }
    };

    // Add Klarna Payments Widget SDK
    useEffect(() => {
        window.klarnaAsyncCallback = function () {
            initializeKlarnaWidget();
        };

        const script = new Script(KLARNA_WIDGET_URL);
        script.load();

        return () => {
            script.remove();
        };
    }, []);

    if (status !== 'error' && status !== 'success') {
        return (
            <div className="adyen-checkout__klarna-widget">
                <div ref={klarnaWidgetRef} />
                {payButton({ status, disabled: status === 'loading', onClick: authorizeKlarna })}
            </div>
        );
    }

    return null;
}
