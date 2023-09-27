import { InstantPaymentTypes } from '../types';
import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';

function splitPaymentMethods(paymentMethods: PaymentMethods, instantPaymentTypes: InstantPaymentTypes[]) {
    return {
        instantPaymentMethods: paymentMethods.paymentMethods.filter(({ type }) => instantPaymentTypes.includes(type as InstantPaymentTypes)),
        paymentMethods: paymentMethods.paymentMethods.filter(({ type }) => !instantPaymentTypes.includes(type as InstantPaymentTypes)),
        storedPaymentMethods: paymentMethods.storedPaymentMethods
    };
}

export default splitPaymentMethods;
