import { useEffect, useRef, useState } from 'preact/hooks';
import { createAdvancedFlowCheckout } from '../../../helpers/create-advanced-checkout';
import { Card } from '../../../../src';
import getCurrency from '../../../utils/get-currency';
import { makePayment } from '../../../helpers/checkout-api-calls';

export const CardWithRedirect = ({ contextArgs }) => {
    const container = useRef(null);
    const checkout = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const createCheckout = async () => {
        const { showPayButton, countryCode, shopperLocale, amount } = contextArgs;

        checkout.current = await createAdvancedFlowCheckout({
            showPayButton,
            countryCode,
            shopperLocale,
            amount
        });

        const cardElement = new Card(checkout.current, {
            ...contextArgs.componentConfiguration,
            onSubmit: async (state, component, actions) => {
                try {
                    const paymentData = {
                        amount: { currency: getCurrency(countryCode), value: amount },
                        countryCode,
                        shopperLocale,
                        authenticationData: {
                            // force redirect flow by not specifying threeDSRequestData
                            attemptAuthentication: 'always'
                        }
                    };

                    const { action, order, resultCode, donationToken } = await makePayment(state.data, paymentData);

                    if (!resultCode) actions.reject();

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });
                } catch (error) {
                    console.error('## onSubmit - critical error', error);
                    actions.reject();
                }
            }
        });
        setElement(cardElement);
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
