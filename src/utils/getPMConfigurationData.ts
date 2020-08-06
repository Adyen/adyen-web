import { PaymentMethod } from '../types';

const getPMConfigurationData = function(paymentMethods: PaymentMethod[], pmType: string): object {
    function getConfigData(acc, pm): object {
        if (pm.type === pmType && pm.configuration) {
            return { ...acc, ...pm.configuration };
        }
        return acc;
    }

    return paymentMethods.reduce(getConfigData, {});
};

export default getPMConfigurationData;
