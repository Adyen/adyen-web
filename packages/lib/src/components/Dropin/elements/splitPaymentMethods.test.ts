import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';
import { InstantPaymentTypes } from '../types';
import splitPaymentMethods from './splitPaymentMethods';

describe('Dropin - splitPaymentMethods', () => {
    test('formatProps filter out instantPaymentMethods from paymentMethods list ', async () => {
        const parsedPaymentMethods = new PaymentMethods({
            paymentMethods: [
                { name: 'Google Pay', type: 'paywithgoogle' },
                { name: 'AliPay', type: 'alipay' }
            ]
        });

        const instantPaymentTypes: InstantPaymentTypes[] = ['paywithgoogle'];

        const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, instantPaymentTypes);

        expect(paymentMethods).toHaveLength(1);
        expect(paymentMethods[0]).toStrictEqual({ type: 'alipay', name: 'AliPay' });
        expect(instantPaymentMethods).toHaveLength(1);
        expect(instantPaymentMethods[0]).toStrictEqual({ name: 'Google Pay', type: 'paywithgoogle' });
    });
});
