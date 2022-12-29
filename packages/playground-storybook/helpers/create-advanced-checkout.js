import AdyenCheckout from '@adyen/adyen-web';
import { amount, countryCode, shopperLocale } from '../config/commonConfig';
import { cancelOrder, checkBalance, createOrder, makeDetailsCall, makePayment, getPaymentMethods } from './checkout-api-calls';

function handleFinalState(resultCode, dropin) {
    localStorage.removeItem('storedPaymentData');

    if (resultCode === 'Authorised' || resultCode === 'Received') {
        dropin.setStatus('success');
    } else {
        dropin.setStatus('error');
    }
}
async function createAdvancedFlowCheckout({ showPayButton, paymentMethodsConfiguration }) {
    const paymentMethodsResponse = await getPaymentMethods();
    const checkout = await AdyenCheckout({
        amount,
        countryCode,
        paymentMethodsResponse,
        locale: shopperLocale,
        clientKey: process.env.CLIENT_KEY,
        environment: process.env.CLIENT_ENV,
        showPayButton,
        paymentMethodsConfiguration,
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

export { createAdvancedFlowCheckout };
