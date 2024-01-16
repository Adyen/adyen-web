import { Meta, StoryObj } from '@storybook/preact';
import { useEffect, useRef } from 'preact/hooks';
import { patchPaypalOrder } from '../../helpers/checkout-api-calls';
import { createSessionsCheckout } from '../../helpers/create-sessions-checkout';

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

const Component = () => {
    const container = useRef(null);

    useEffect(() => {
        async function createPaypalComponent() {
            const checkout = await createSessionsCheckout({
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

                onShippingAddressChange: async (data, actions, component) => {
                    const patch = {
                        sessionId: checkout.session.id,
                        paymentData: component.paymentData,
                        amount: {
                            currency: 'USD',
                            value: 27000
                        }
                    };

                    if (data.shippingAddress.countryCode === 'US') {
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
