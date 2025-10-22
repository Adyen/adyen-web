import { h, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import Card from '../../Card';
import getCurrency from '../../../../../storybook/utils/get-currency';
import { makeDetailsCall, makePayment } from '../../../../../storybook/helpers/checkout-api-calls';
import { handleFinalState } from '../../../../../storybook/helpers/checkout-handlers';
import { AdyenCheckout } from '../../../../core/AdyenCheckout';
import { PaymentMethodStoryProps } from '../../../../../storybook/types';
import { CardConfiguration } from '../../types';
import './card3DS2CreateFromAction.scss';

export const CardWith3DS2CreateFromAction = (contextArgs: PaymentMethodStoryProps<CardConfiguration>) => {
    const { componentConfiguration, ...checkoutConfig } = contextArgs;

    const { countryCode, amount, shopperLocale } = checkoutConfig;

    const container = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const createCheckout = async () => {
        const checkout = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            amount: { currency: getCurrency(countryCode), value: amount },
            countryCode,
            locale: shopperLocale,
            onSubmit: async (state, component, actions) => {
                try {
                    const paymentData = {
                        amount: { currency: getCurrency(countryCode), value: amount },
                        countryCode,
                        shopperLocale
                    };

                    const { action, order, resultCode, donationToken } = await makePayment(state.data, paymentData);

                    if (!resultCode) actions.reject();

                    if (action) {
                        globalThis.checkout.createFromAction(action).mount('#threeDSField');
                    } else {
                        actions.resolve({
                            resultCode,
                            action,
                            order,
                            donationToken
                        });
                    }
                } catch (error) {
                    console.error('## onSubmit - critical error', error);
                    actions.reject();
                }
            },

            onAdditionalDetails: async (state, component, actions) => {
                try {
                    const { resultCode, action, order, donationToken } = await makeDetailsCall(state.data);

                    console.log('### CardWith3DS2CreateFromAction::onAdditionalDetails:: actions', actions);

                    if (!resultCode) actions.reject();

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });
                } catch (error) {
                    console.error('## onAdditionalDetails - critical error', error);
                    actions.reject();
                }
            },

            onPaymentCompleted(result, element) {
                console.log('onPaymentCompleted', result, element);
                handleFinalState(result, element);
            },

            onPaymentFailed(result, element) {
                console.log('onPaymentFailed', result, element);
                handleFinalState(result, element);
            }
        });

        globalThis.checkout = checkout;

        const card = new Card(checkout, { ...componentConfiguration });

        setElement(card);
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

    return (
        <Fragment>
            {errorMessage ? (
                <div>{errorMessage}</div>
            ) : (
                <div>
                    <div ref={container} id="component-root" className="component-wrapper" />
                    <div id={'threeDSField'} className={'threeds2-field'}></div>
                    <div className="info">
                        <h2>3DS2 Test card numbers:</h2>
                        <table style="margin-bottom: 0">
                            <caption>3DS2 test cards</caption>
                            <thead>
                                <tr>
                                    <th scope="col">3DS2 Action</th>
                                    <th scope="col">Card Number</th>
                                    <th scope="col">Expiry Date / CVC</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Frictionless flow (mc)</td>
                                    <td>5201281505129736</td>
                                    <td>03/30 ------ 737</td>
                                </tr>
                                <tr>
                                    <td>Challenge-only flow (visa)</td>
                                    <td>4212345678910006</td>
                                    <td>03/30 ------ 737</td>
                                </tr>
                                <tr>
                                    <td>Full flow (maestro)</td>
                                    <td>5000550000000029</td>
                                    <td>03/30 ------ 737</td>
                                </tr>
                            </tbody>
                        </table>
                        <p>
                            <a
                                href="https://docs.adyen.com/development-resources/testing/3d-secure-2-authentication/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                More information →
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </Fragment>
    );
};
