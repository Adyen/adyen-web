import { createCard } from './Card';
import { getPaymentMethods } from '../../services';
import AdyenCheckout from '@adyen/adyen-web';
import { amount, countryCode, shopperLocale } from '@adyen/adyen-web-playground/src/config/commonConfig';
import { cancelOrder, checkBalance, createOrder, makeDetailsCall, makePayment } from '@adyen/adyen-web-playground/src/services';

export default {
    title: 'Card',
    argTypes: {
        sessions: {
            defaultValue: 'true',
            control: 'boolean'
        }
    }
    // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
};

const Template = (args, { loaded: { checkout } }) => {
    return createCard({ checkout, ...args });
};
export const Card = Template.bind({});

async function createAdvancedFlowCheckout() {
    const paymentMethodsResponse = await getPaymentMethods();
    const checkout = await AdyenCheckout({
        amount,
        countryCode,
        clientKey: 'test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
        // clientKey: process.env.__CLIENT_KEY__,
        paymentMethodsResponse,
        locale: shopperLocale,
        environment: 'test',
        onSubmit: async (state, component) => {
            const result = await makePayment(state.data);

            // handle actions
            if (result.action) {
                // demo only - store paymentData & order
                if (result.action.paymentData) localStorage.setItem('storedPaymentData', result.action.paymentData);
                component.handleAction(result.action);
            } else if (result.order && result.order?.remainingAmount?.value > 0) {
                // handle orders
                const order = {
                    orderData: result.order.orderData,
                    pspReference: result.order.pspReference
                };

                const orderPaymentMethods = await getPaymentMethods({ order, amount, shopperLocale });
                checkout.update({
                    paymentMethodsResponse: orderPaymentMethods,
                    order,
                    amount: result.order.remainingAmount
                });
            } else {
                handleFinalState(result.resultCode, component);
            }
        },
        onChange: state => {
            console.log('onChange', state);
        },
        onAdditionalDetails: async (state, component) => {
            const result = await makeDetailsCall(state.data);

            if (result.action) {
                component.handleAction(result.action);
            } else {
                handleFinalState(result.resultCode, component);
            }
        },
        onBalanceCheck: async (resolve, reject, data) => {
            resolve(await checkBalance(data));
        },
        onOrderRequest: async (resolve, reject) => {
            resolve(await createOrder({ amount }));
        },
        onOrderCancel: async order => {
            await cancelOrder(order);
            checkout.update({
                paymentMethodsResponse: await getPaymentMethods({ amount, shopperLocale }),
                order: null,
                amount
            });
        },
        onError: (error, component) => {
            console.info(error.name, error.message, error.stack, component);
        }
    });

    return checkout;
}

Card.loaders = [
    async (...args) => {
        // const checkout = args.args.sessions ? createSessionsCheckout() : createAdvancedFlowCheckout();
        const checkout = await createAdvancedFlowCheckout();

        const paymentMethodsResponse = await getPaymentMethods();

        console.log(checkout);
        console.log(paymentMethodsResponse);
        // maybe could get the configuration set here (sessions, manual), initialize checkout e pass it back to the render part?
        return { checkout };
    }
];
//
// export const CardWithAVS = Template.bind({});
// CardWithAVS.loaders = [
//     async () => ({
//         paymentMethodsResponse: await getPaymentMethods()
//     })
// ];
