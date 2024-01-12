import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { createSession, patchPaypalOrder } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';

export async function initSession() {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
        telephoneNumber: '+611223344',
        shopperEmail: 'shopper.ctp1@adyen.com',
        countryCode
    });

    const checkout = await AdyenCheckout({
        environment: process.env.__CLIENT_ENV__,
        clientKey: process.env.__CLIENT_KEY__,
        session,

        // Events
        beforeSubmit: (data, component, actions) => {
            actions.resolve(data);
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
        },
        onError: (error, component) => {
            console.info(JSON.stringify(error), component);
        },
        onChange: (state, component) => {
            console.log('onChange', state);
        },
        paymentMethodsConfiguration: {
            paywithgoogle: {
                buttonType: 'plain'
            },
            card: {
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',
                positionHolderNameOnTop: true,

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressMode: 'partial'
            },
            paypal: {
                isExpress: true,

                onShippingAddressChange: async (data, actions, component) => {
                    const patch = {
                        sessionId: session.id,
                        paymentData: component.paymentData,
                        amount: {
                            currency: 'USD',
                            value: 29900
                        }
                    };

                    console.log('### onShippingAddressChange Sessions', data, actions, component, patch);

                    if (data.shippingAddress.countryCode === 'US') {
                        const { paymentData } = await patchPaypalOrder(patch);
                        component.updatePaymentData(paymentData);
                        return;
                    }

                    return actions.reject();
                }
            }
        }
    });

    const dropin = checkout
        .create('dropin', {
            instantPaymentTypes: ['googlepay']
        })
        .mount('#dropin-container');
    return [checkout, dropin];
}
