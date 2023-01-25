import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/es/adyen.css';
import { createSession } from '../../services';
import { amount, shopperLocale, shopperReference, countryCode, returnUrl } from '../../config/commonConfig';

export async function initSession() {
    const session = await createSession({
        amount,
        reference: 'ABC123',
        returnUrl,
        shopperLocale,
        shopperReference,
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
            paypal: {
                onReceiveOrderData(orderData) {
                    console.log('Order data', orderData);
                },
                onShippingChange: function(data, actions) {
                    const baseOrderAmount = window.checkout.options.amount.value;

                    /**
                     * Have to convert our amount format to how PayPal expects. In this example, USD
                     * Converts 25900 to '259.00'
                     */
                    const baseOrderAmountInUSD = (parseInt(String(baseOrderAmount), 10) / 100).toFixed(2);
                    const shippingAmount = data.shipping_address.country_code === 'NL' ? '0' : '30.00';

                    const valueWithShipping = (parseFloat(baseOrderAmountInUSD) + parseFloat(shippingAmount)).toFixed(2);

                    console.log('Updating amount to: ', valueWithShipping);

                    if (baseOrderAmountInUSD === valueWithShipping) {
                        return actions.resolve();
                    }

                    return actions.order.patch([
                        {
                            op: 'replace',
                            path: "/purchase_units/@reference_id=='default'/amount",
                            value: {
                                currency_code: 'USD',
                                value: (parseFloat(baseOrderAmountInUSD) + parseFloat(shippingAmount)).toFixed(2),
                                breakdown: {
                                    item_total: {
                                        currency_code: 'USD',
                                        value: baseOrderAmountInUSD
                                    },
                                    shipping: {
                                        currency_code: 'USD',
                                        value: shippingAmount
                                    }
                                }
                            }
                        }
                    ]);
                }
            },
            card: {
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',
                positionHolderNameOnTop: true,

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressMode: 'partial'
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
