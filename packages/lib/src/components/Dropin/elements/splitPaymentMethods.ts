import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';

import type { InstantPaymentTypes } from '../types';
import type { PaymentMethod, StoredPaymentMethod } from '../../../types/global-types';

interface SplitPaymentMethods {
    fastlanePaymentMethod: PaymentMethod | undefined;
    storedPaymentMethods: StoredPaymentMethod[];
    paymentMethods: PaymentMethod[];
    instantPaymentMethods: PaymentMethod[];
}

function splitPaymentMethods(paymentMethods: PaymentMethods, instantPaymentTypes: InstantPaymentTypes[]): SplitPaymentMethods {
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
