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
        expect(paymentMethods[0]).toMatchObject({ type: 'alipay', name: 'AliPay', _id: expect.any(String) });
        expect(instantPaymentMethods).toHaveLength(1);
        expect(instantPaymentMethods[0]).toMatchObject({ name: 'Google Pay', type: 'paywithgoogle', _id: expect.any(String) });
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
        expect(paymentMethods[0]).toMatchObject({ type: 'alipay', name: 'AliPay', _id: expect.any(String) });
        expect(paymentMethods[1]).toMatchObject({ type: 'kakaopay', name: 'KakaoPay', _id: expect.any(String) });
        expect(instantPaymentMethods).toHaveLength(1);
        expect(instantPaymentMethods[0]).toMatchObject({ name: 'ApplePay', type: 'applepay', _id: expect.any(String) });
        expect(fastlanePaymentMethod).toMatchObject({ name: 'Fastlane', type: 'fastlane', brands: ['visa'], _id: expect.any(String) });
        expect(storedPaymentMethods).toHaveLength(0);
    });
});
