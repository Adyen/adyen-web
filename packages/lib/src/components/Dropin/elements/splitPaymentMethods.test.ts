import PaymentMethods from '../../../core/ProcessResponse/PaymentMethods';
import splitPaymentMethods from './splitPaymentMethods';
import type { InstantPaymentTypes } from '../types';

describe('Dropin - splitPaymentMethods', () => {
    test('should remove instantPaymentMethods from paymentMethods', () => {
        const parsedPaymentMethods = new PaymentMethods({
            paymentMethods: [
                { name: 'Google Pay', type: 'paywithgoogle' },
                { name: 'AliPay', type: 'alipay' }
            ]
        });

        const instantPaymentTypes: InstantPaymentTypes[] = ['paywithgoogle'];

        const { paymentMethods, instantPaymentMethods, fastlanePaymentMethod, storedPaymentMethods } = splitPaymentMethods(
            parsedPaymentMethods,
            instantPaymentTypes
        );

        expect(paymentMethods).toHaveLength(1);
        expect(paymentMethods[0]).toStrictEqual({ type: 'alipay', name: 'AliPay' });
        expect(instantPaymentMethods).toHaveLength(1);
        expect(instantPaymentMethods[0]).toStrictEqual({ name: 'Google Pay', type: 'paywithgoogle' });
        expect(fastlanePaymentMethod).toBeUndefined();
        expect(storedPaymentMethods).toHaveLength(0);
    });

    test('should remove fastlane from paymentMethods', () => {
        const parsedPaymentMethods = new PaymentMethods({
            paymentMethods: [
                { name: 'ApplePay', type: 'applepay' },
                { name: 'AliPay', type: 'alipay' },
                { name: 'KakaoPay', type: 'kakaopay' },
                { name: 'Fastlane', type: 'fastlane', brands: ['visa'] }
            ]
        });

        const instantPaymentTypes: InstantPaymentTypes[] = ['applepay'];

        const { paymentMethods, instantPaymentMethods, fastlanePaymentMethod, storedPaymentMethods } = splitPaymentMethods(
            parsedPaymentMethods,
            instantPaymentTypes
        );

        expect(paymentMethods).toHaveLength(2);
        expect(paymentMethods[0]).toStrictEqual({ type: 'alipay', name: 'AliPay' });
        expect(paymentMethods[1]).toStrictEqual({ type: 'kakaopay', name: 'KakaoPay' });
        expect(instantPaymentMethods).toHaveLength(1);
        expect(instantPaymentMethods[0]).toStrictEqual({ name: 'ApplePay', type: 'applepay' });
        expect(fastlanePaymentMethod).toStrictEqual({ name: 'Fastlane', type: 'fastlane', brands: ['visa'] });
        expect(storedPaymentMethods).toHaveLength(0);
    });
});
