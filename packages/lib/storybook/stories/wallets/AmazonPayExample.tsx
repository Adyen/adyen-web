import { useEffect, useRef, useState } from 'preact/hooks';
import { createSessionsCheckout } from '../../helpers/create-sessions-checkout';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import { PaymentMethodStoryProps } from '../types';
import AmazonPay from '../../../src/components/AmazonPay';
import { AmazonPayConfiguration } from '../../../src/components/AmazonPay/types';

interface AmazonPayExampleProps {
    contextArgs: PaymentMethodStoryProps<AmazonPayConfiguration>;
}

export const AmazonPayExample = ({ contextArgs }: AmazonPayExampleProps) => {
    const container = useRef(null);
    const checkout = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const createCheckout = async () => {
        const { useSessions, showPayButton, countryCode, shopperLocale, amount } = contextArgs;

        //URL selection
        // http://localhost:3020/iframe.html?id=wallets-amazonpay--default&viewMode=story
        // http://localhost:3020/?path=/story/wallets-amazonpay--default
        // either has iframe or path

        const urlSearchParams = new URLSearchParams(window.location.search);
        const amazonCheckoutSessionId = urlSearchParams.get('amazonCheckoutSessionId');
        const step = urlSearchParams.get('step');

        // TODO move this to args
        const chargeOptions = {
            // chargePermissionType: 'Recurring',
            // recurringMetadata: {
            //     frequency: {
            //         unit: 'Month',
            //         value: '1'
            //     }
            // }
        };

        checkout.current = useSessions
            ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount })
            : await createAdvancedFlowCheckout({
                  showPayButton,
                  countryCode,
                  shopperLocale,
                  amount
              });

        if (step === 'review') {
            const amazonPayElement = new AmazonPay({
                core: checkout.current,
                ...chargeOptions,
                /**
                 * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
                 */
                amazonCheckoutSessionId,
                cancelUrl: 'http://localhost:3020/iframe.html?id=wallets-amazonpay--default&viewMode=story',
                returnUrl: 'http://localhost:3020/iframe.html?id=wallets-amazonpay--default&viewMode=story&step=result'
            });
            setElement(amazonPayElement);
        } else if (step === 'result') {
            const amazonPayElement = new AmazonPay({
                core: checkout.current,
                /**
                 * The merchant will receive the amazonCheckoutSessionId attached in the return URL.
                 */
                amazonCheckoutSessionId,
                showOrderButton: false,
                onSubmit: (state, component) => {
                    return makePayment(state.data)
                        .then(response => {
                            if (response.action) {
                                component.handleAction(response.action);
                            } else if (response?.resultCode && checkPaymentResult(response.resultCode)) {
                                alert(response.resultCode);
                            } else {
                                // Try handling the decline flow
                                // This will redirect the shopper to select another payment method
                                component.handleDeclineFlow();
                            }
                        })
                        .catch(error => {
                            throw Error(error);
                        });
                },
                onError: e => {
                    if (e.resultCode) {
                        alert(e.resultCode);
                    } else {
                        console.error(e);
                    }
                }
            });
            setElement(amazonPayElement);
        } else {
            const amazonPayElement = new AmazonPay({
                core: checkout.current,

                productType: 'PayOnly',
                ...chargeOptions,
                // Regular checkout:
                // checkoutMode: 'ProcessOrder'

                // Express Checkout flow:
                returnUrl: 'http://localhost:3020/?path=/story/wallets-amazonpay--default&step=review'
            });
            setElement(amazonPayElement);
        }
    };

    useEffect(() => {
        void createCheckout();
    }, [contextArgs]);

    useEffect(() => {
        if (element?.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    element.mount(container.current);
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else if (element) {
            element.mount(container.current);
        }
    }, [element]);

    return <div>{errorMessage ? <div>{errorMessage}</div> : <div ref={container} id="component-root" className="component-wrapper" />}</div>;
};
