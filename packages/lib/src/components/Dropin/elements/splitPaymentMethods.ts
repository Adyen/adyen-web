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
    const isFastlane = ({ type }: PaymentMethod) => type === 'fastlane';
    const isInstantPaymentMethod = ({ type }: PaymentMethod) => instantPaymentTypes.includes(type as InstantPaymentTypes);

    return {
        fastlanePaymentMethod: paymentMethods.paymentMethods.find(isFastlane),
        instantPaymentMethods: paymentMethods.paymentMethods.filter(isInstantPaymentMethod),
        paymentMethods: paymentMethods.paymentMethods.filter(pm => !isInstantPaymentMethod(pm) && !isFastlane(pm)),
        storedPaymentMethods: paymentMethods.storedPaymentMethods
    };
}

export default splitPaymentMethods;
