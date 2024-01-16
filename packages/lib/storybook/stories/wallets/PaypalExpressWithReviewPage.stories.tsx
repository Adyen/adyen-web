import { Meta, StoryObj } from '@storybook/preact';
import { useEffect, useRef } from 'preact/hooks';
import { handleSubmit } from '../../helpers/checkout-handlers';
import { patchPaypalOrder } from '../../helpers/checkout-api-calls';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';

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
                shopperLocale: SHOPPER_LOCALE,
                paymentMethodsConfiguration: {}
            });

            if (!checkout) {
                return;
            }

            const paypal = checkout.create('paypal', {
                isExpress: true,

                userAction: 'continue',

                blockPayPalVenmoButton: true,
                blockPayPalCreditButton: true,
                blockPayPalPayLaterButton: true,

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
                    return;
                    // const patch = {
                    //     pspReference: store.getState().pspReference,
                    //     paymentData: component.paymentData,
                    //     amount: {
                    //         currency: 'USD',
                    //         value: 27000
                    //     }
                    // };
                    //
                    // if (data.shippingAddress.countryCode === 'US') {
                    //     const { paymentData } = await patchPaypalOrder(patch);
                    //     component.updatePaymentData(paymentData);
                    //
                    //     store.setState({ amountValue: patch.amount.value });
                    //     return;
                    // }
                    //
                    // return actions.reject();
                },

                onShopperDetails(shopperDetails, paypalOrder, actions) {
                    store.setState({ shopperDetails });
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
