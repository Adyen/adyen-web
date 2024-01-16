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

export const ExpressWithAdvancedFlow: StoryObj = {
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
    let pspReference = null;
    return {
        setPspReference(value: string) {
            pspReference = value;
        },
        getPspReference() {
            return pspReference;
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
                    store.setPspReference(pspReference);
                },

                onShippingAddressChange: async (data, actions, component) => {
                    const patch = {
                        pspReference: store.getPspReference(),
                        paymentData: component.paymentData,
                        amount: {
                            currency: 'USD',
                            value: 27000
                        }
                    };

                    if (data.shippingAddress.countryCode === 'US') {
                        patch.amount.value = 27999;
                        const { paymentData } = await patchPaypalOrder(patch);
                        component.updatePaymentData(paymentData);
                        return;
                    }

                    if (data.shippingAddress.countryCode === 'BR') {
                        patch.amount.value = 26599;
                        const { paymentData } = await patchPaypalOrder(patch);
                        component.updatePaymentData(paymentData);
                        return;
                    }

                    return actions.reject();
                },

                onShopperDetails(shopperDetails, paypalOrder, actions) {
                    console.log(shopperDetails, paypalOrder, actions);
                    actions.resolve();
                }
            });
            paypal.mount(container.current);
        }

        void createPaypalComponent();
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
