import { InstantPaymentTypes } from '../types';
import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';

function splitPaymentMethods(paymentMethods: PaymentMethods, instantPaymentTypes: InstantPaymentTypes[]) {
    return {
        fastlanePaymentMethod: paymentMethods.paymentMethods.find(({ type }) => ['fastlane'].includes(type)),
        instantPaymentMethods: paymentMethods.paymentMethods.filter(({ type }) => instantPaymentTypes.includes(type as InstantPaymentTypes)),
        paymentMethods: paymentMethods.paymentMethods.filter(
            ({ type }) => !instantPaymentTypes.includes(type as InstantPaymentTypes) && !['fastlane'].includes(type)
        ),
        storedPaymentMethods: paymentMethods.storedPaymentMethods
    };
}

export default splitPaymentMethods;
