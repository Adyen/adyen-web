import { Meta, StoryObj } from '@storybook/preact';
import { useEffect, useRef } from 'preact/hooks';
import { handleSubmit } from '../../../helpers/checkout-handlers';
import { patchPaypalOrder } from '../../../helpers/checkout-api-calls';
import { createAdvancedFlowCheckout } from '../../../helpers/create-advanced-checkout';
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
let SHOPPER_SHIPPING_COUNTRY_CODE = '';

/**
 * We are handling delivery methods update, validations, and final amount calculation on the UI side for DEMO purposes.
 * This must be implemented on the backend side by the merchant for safety reasons.
 */

export const ExpressWithReviewPage: StoryObj = {
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

const createLocalStore = () => {
    let state = null;

    return {
        setState(value: object) {
            state = { ...state, ...value };
        },
        getState() {
            return state;
        }
    };
};
const store = createLocalStore();

const Component = () => {
    const container = useRef(null);

    useEffect(() => {
        async function createPaypalComponent() {
            const checkout = await createAdvancedFlowCheckout({
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
                userAction: 'continue',

                blockPayPalVenmoButton: true,
                blockPayPalCreditButton: true,
                blockPayPalPayLaterButton: true,

                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onSubmit: async (state, component) => {
                    const paymentData = {
                        amount: AMOUNT,
                        countryCode: COUNTRY_CODE,
                        shopperLocale: SHOPPER_LOCALE
                    };

                    const { pspReference } = await handleSubmit(state, component, checkout, paymentData);
                    store.setState({ pspReference, amountValue: AMOUNT.value });
                },

                onShippingAddressChange: async (data, actions, component) => {
                    // Store the country code value, so it can be used in the 'onShippingOptionsChange'
                    SHOPPER_SHIPPING_COUNTRY_CODE = data.shippingAddress.countryCode;

                    if (data.shippingAddress.countryCode !== 'US' && data.shippingAddress.countryCode !== 'NL') {
                        return actions.reject();
                    }

                    const patch = {
                        pspReference: store.getState().pspReference,
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

                    store.setState({ amountValue: patch.amount.value });

                    const { paymentData } = await patchPaypalOrder(patch);
                    component.updatePaymentData(paymentData);
                },

                onShippingOptionsChange: async (data, actions, component) => {
                    if (data.selectedShippingOption.label.includes('Teleport')) {
                        return actions.reject(data.errors.METHOD_UNAVAILABLE);
                    }

                    const patch = {
                        pspReference: store.getState().pspReference,
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

                    store.setState({ amountValue: patch.amount.value });

                    const { paymentData } = await patchPaypalOrder(patch);
                    component.updatePaymentData(paymentData);
                },

                onAuthorized(data, actions) {
                    console.log('onAuthorized', data);
                    store.setState({
                        deliveryAddress: data.deliveryAddress,
                        paypalOrder: data.authorizedEvent
                    });
                    actions.resolve();
                },

                onAdditionalDetails(state) {
                    store.setState({ paymentDetails: state });
                    sessionStorage.setItem('adyen-paypal-review-page-data', JSON.stringify(store.getState()));

                    window.parent.location.assign('/?path=/story/helpers-paypalreviewpage--paypal-review-page');
                }
            });
            paypal.mount(container.current);
        }

        void createPaypalComponent();
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
