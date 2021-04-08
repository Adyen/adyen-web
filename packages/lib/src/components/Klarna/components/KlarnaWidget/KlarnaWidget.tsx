import Script from '../../../../utils/Script';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Fragment, h } from 'preact';
import { KlarnaWidgetProps } from '../../types';
import { KLARNA_WIDGET_URL } from '../../constants';

interface KlarnaWidgetAuthorizeResponse {
    approved: boolean;
    show_form: boolean;
    authorization_token: string;
    error?: any;
}

export function KlarnaWidget({ sdkData, paymentMethodType, payButton, ...props }: KlarnaWidgetProps) {
    const klarnaWidgetRef = useRef(null);
    const [status, setStatus] = useState('ready');

    const klarnaVariants = {
        klarna: 'pay_later',
        klarna_paynow: 'pay_now',
        klarna_account: 'pay_over_time'
    };

    const handleError = error => {
        setStatus('error');
        props.onError(error);
    };
    const initializeKlarnaWidget = () => {
        window.Klarna.Payments.init({
            client_token: sdkData.client_token
        });

        window.Klarna.Payments.load(
            {
                container: klarnaWidgetRef.current,
                payment_method_category: klarnaVariants[paymentMethodType]
            },
            function(res) {
                // If show_form: true is received together with an error, something fixable is wrong and the consumer
                // needs to take action before moving forward
                // If show_form: false, the payment method in the loaded widget will not be offered for this order
                // based on Klarna’s pre-assessment.
                if (!res.show_form || !!res.error) {
                    handleError(res);
                }
            }
        );
    };

    const authorizeKlarna = () => {
        setStatus('loading');
        try {
            window.Klarna.Payments.authorize(
                {
                    payment_method_category: klarnaVariants[paymentMethodType]
                },
                function(res: KlarnaWidgetAuthorizeResponse) {
                    if (res.approved === true) {
                        setStatus('success');
                        props.onComplete({
                            data: {
                                paymentData: props.paymentData,
                                details: {
                                    token: res.authorization_token
                                }
                            }
                        });
                    }
                }
            );
        } catch (e) {
            handleError(e);
        }
    };

    // Add Klarna Payments Widget SDK
    useEffect(() => {
        window.klarnaAsyncCallback = function() {
            initializeKlarnaWidget();
        };

        const script = new Script(KLARNA_WIDGET_URL);
        script.load().then(() => {});

        return () => {
            script.remove();
        };
    }, []);

    if (status !== 'error') {
        return (
            <Fragment>
                <div ref={klarnaWidgetRef} />
                {payButton({ status, disabled: status === 'loading', onClick: authorizeKlarna })}
            </Fragment>
        );
    }

    return null;
}
