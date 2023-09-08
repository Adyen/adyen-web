import { PaymentMethodsConfiguration } from '../../types';

export const getComponentConfiguration = (type: string, paymentMethodsConfiguration: PaymentMethodsConfiguration = {}, isStoredCard = false) => {
    const pmType = type === 'scheme' ? 'card' : type;

    if (pmType === 'card' && isStoredCard) {
        return paymentMethodsConfiguration['storedCard'] || {};
    }

    return paymentMethodsConfiguration[pmType] || {};
};
