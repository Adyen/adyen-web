import { PaymentMethodsResponse } from '../../../core/ProcessResponse/PaymentMethodsResponse/types';
import { InstantPaymentTypes } from '../types';

function splitPaymentMethods(paymentMethodsResponse: PaymentMethodsResponse, instantPaymentTypes: InstantPaymentTypes[]) {
    const { storedPaymentMethods, paymentMethods } = paymentMethodsResponse;

    return {
        instantPaymentMethods: paymentMethods.filter(({ type }) => instantPaymentTypes.includes(type as InstantPaymentTypes)),
        paymentMethods: paymentMethods.filter(({ type }) => !instantPaymentTypes.includes(type as InstantPaymentTypes)),
        storedPaymentMethods
    };
}

export default splitPaymentMethods;
