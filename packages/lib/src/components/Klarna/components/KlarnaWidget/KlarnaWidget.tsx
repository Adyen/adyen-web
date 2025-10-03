import { h } from 'preact';
import { useEffect, useRef, useState, useCallback } from 'preact/hooks';
import Script from '../../../../utils/Script';
import { KLARNA_WIDGET_URL } from '../../constants';
import type { KlarnaWidgetAuthorizeResponse, KlarnaWidgetProps } from '../../types';

import './KlarnaWidget.scss';
import useAnalytics from '../../../../core/Analytics/useAnalytics';

export function KlarnaWidget({ sdkData, paymentMethodType, widgetInitializationTime, payButton, ...props }: KlarnaWidgetProps) {
    const klarnaWidgetRef = useRef(null);
    const [status, setStatus] = useState('ready');
    const { analytics } = useAnalytics();

    const handleError = useCallback(() => {
        setStatus('error');
        props.onComplete({
            data: {
                paymentData: props.paymentData,
                details: {}
            }
        });
    }, [props.paymentData, props.onComplete]);

    const initializeKlarnaWidget = useCallback(() => {
        window.Klarna.Payments.init({
            client_token: sdkData.client_token
        });

        window.Klarna.Payments.load(
            {
                container: klarnaWidgetRef.current,
                payment_method_category: sdkData.payment_method_category
            },
            function (res: { show_form: boolean; error: unknown }) {
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
    }, [sdkData.client_token, sdkData.payment_method_category]);

    const authorizeKlarna = useCallback(() => {
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
    }, [sdkData.payment_method_category, props.onComplete, props.onError]);

    /**
     * TODO: Clean this up when we have a different solution for handling on click in the BaseElement class
     * We need this specifically for handling ENTER keypresses from the keyboard
     * because the UIElement class has an on keypress handler which can trigger a components submit function
     * ENTER key press on this button should not trigger this behaviour since the Klarna script has already been loaded
     */
    const handleKeyDown = (e: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.code === 'Enter') {
            e.preventDefault();
            authorizeKlarna();
        }
    };

    /**
     * Initializes Klarna SDK if it is already available and reinitialize
     * it when the init time refreshes
     */
    useEffect(() => {
        const isKlarnaAvailable = window.Klarna?.Payments?.init;
        if (isKlarnaAvailable) {
            initializeKlarnaWidget();
        }
    }, [widgetInitializationTime]);

    useEffect(() => {
        window.klarnaAsyncCallback = function () {
            initializeKlarnaWidget();
        };
        const script = new Script({
            src: KLARNA_WIDGET_URL,
            component: 'klarna',
            analytics
        });

        void script.load();

        return () => {
            script.remove();
        };
    }, [initializeKlarnaWidget, analytics]);

    if (status !== 'error' && status !== 'success') {
        return (
            <div className="adyen-checkout__klarna-widget">
                <div ref={klarnaWidgetRef} />
                {payButton({
                    status,
                    disabled: status === 'loading',
                    onClick: authorizeKlarna,
                    onKeyDown: handleKeyDown
                })}
            </div>
        );
    }

    return null;
}
