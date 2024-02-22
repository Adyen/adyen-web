import { Meta, StoryObj } from '@storybook/preact';
import { useEffect, useRef } from 'preact/hooks';
import { patchPaypalOrder } from '../../../helpers/checkout-api-calls';
import { createSessionsCheckout } from '../../../helpers/create-sessions-checkout';
import { getDeliveryMethods, getSelectedDeliveryMethodAmount } from './paypal-stories-utils';
import { PayPal } from '../../../../src';

const meta: Meta = {
    title: 'Wallets/Paypal'
};
export default meta;

const AMOUNT = {
    value: 25000,
    currency: 'USD'
};
const COUNTRY_CODE = 'US';
const SHOPPER_LOCALE = 'en-US';

/**
 * We are handling delivery methods update, validations, and final amount calculation on the UI side for DEMO purposes.
 * This must be implemented on the backend side by the merchant for safety reasons.
 */

export const ExpressWithSessionsFlow: StoryObj = {
    render: () => {
        return <Component />;
    },
    argTypes: {
        useSessions: {
            control: false
        },
        countryCode: {
            control: false
        },
        amount: {
            control: false
        },
        shopperLocale: {
            control: false
        },
        showPayButton: {
            control: false
        }
    }
};

let SHOPPER_SHIPPING_COUNTRY_CODE = '';

const Component = () => {
    const container = useRef(null);

    useEffect(() => {
        async function createPaypalComponent() {
            const checkout = await createSessionsCheckout({
                showPayButton: true,
                amount: AMOUNT.value,
                countryCode: COUNTRY_CODE,
                shopperLocale: SHOPPER_LOCALE
            });

            if (!checkout) {
                return;
            }

            const paypal = new PayPal(checkout, {
                isExpress: true,

                blockPayPalVenmoButton: true,
                blockPayPalCreditButton: true,
                blockPayPalPayLaterButton: true,

                onShippingAddressChange: async (data, actions, component) => {
                    // Store the country code value, so it can be used in the 'onShippingOptionsChange'
                    SHOPPER_SHIPPING_COUNTRY_CODE = data.shippingAddress.countryCode;

                    if (data.shippingAddress.countryCode !== 'US' && data.shippingAddress.countryCode !== 'NL') {
                        return actions.reject();
                    }

                    const patch = {
                        sessionId: checkout.session.id,
                        paymentData: component.paymentData,
                        amount: {
                            currency: 'USD',
                            value:
                                AMOUNT.value +
                                getSelectedDeliveryMethodAmount({ countryCode: data.shippingAddress.countryCode, deliveryMethodId: '1' })
                        },
                        deliveryMethods: getDeliveryMethods({
                            countryCode: data.shippingAddress.countryCode,
                            deliveryMethodId: '1'
                        })
                    };

                    const { paymentData } = await patchPaypalOrder(patch);
                    component.updatePaymentData(paymentData);
                },

                onShippingOptionsChange: async (data, actions, component) => {
                    if (data.selectedShippingOption.label.includes('Teleport')) {
                        return actions.reject(data.errors.METHOD_UNAVAILABLE);
                    }

                    const patch = {
                        sessionId: checkout.session.id,
                        paymentData: component.paymentData,
                        amount: {
                            currency: 'USD',
                            value:
                                AMOUNT.value +
                                getSelectedDeliveryMethodAmount({
                                    countryCode: SHOPPER_SHIPPING_COUNTRY_CODE,
                                    deliveryMethodId: data.selectedShippingOption.id
                                })
                        },
                        deliveryMethods: getDeliveryMethods({
                            countryCode: SHOPPER_SHIPPING_COUNTRY_CODE,
                            deliveryMethodId: data.selectedShippingOption.id
                        })
                    };

                    const { paymentData } = await patchPaypalOrder(patch);
                    component.updatePaymentData(paymentData);
                },

                onAuthorized(data, actions) {
                    console.log('onShopperDetails', data);
                    actions.resolve();
                }
            });
            paypal.mount(container.current);
        }

        void createPaypalComponent();
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
