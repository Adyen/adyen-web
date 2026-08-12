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

    describe('Custom display mode', () => {
        test('should group a payment method with custom display mode "instant" as instant', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'instant' } },
                    { name: 'AliPay', type: 'alipay', configuration: { displayMode: 'regular' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, []);

            expect(instantPaymentMethods).toHaveLength(1);
            expect(instantPaymentMethods[0]).toMatchObject({ type: 'googlepay' });
            expect(paymentMethods).toHaveLength(1);
            expect(paymentMethods[0]).toMatchObject({ type: 'alipay' });
        });

        test('should ignore instantPaymentTypes entirely once custom display mode is set', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'instant' } },
                    { name: 'ApplePay', type: 'applepay', configuration: { displayMode: 'regular' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['applepay']);

            expect(instantPaymentMethods).toHaveLength(1);
            expect(instantPaymentMethods[0]).toMatchObject({ type: 'googlepay' });
            expect(paymentMethods).toHaveLength(1);
            expect(paymentMethods[0]).toMatchObject({ type: 'applepay' });
        });

        test('should group no instant payment methods when custom display mode only sends regular', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'regular' } },
                    { name: 'AliPay', type: 'alipay', configuration: { displayMode: 'regular' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            expect(instantPaymentMethods).toHaveLength(0);
            expect(paymentMethods).toHaveLength(2);
        });

        test('should not surface a non-supported payment method in the instant group', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [{ name: 'PayPal', type: 'paypal', configuration: { displayMode: 'instant' } }]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, []);

            expect(instantPaymentMethods).toHaveLength(0);
            expect(paymentMethods).toHaveLength(1);
            expect(paymentMethods[0]).toMatchObject({ type: 'paypal' });
        });

        test('should fall back to regular for the unknown custom display mode', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [{ name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'INVALID_VALUE' } }]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            // any displayMode hands the decision to the response, so instantPaymentTypes no longer applies
            expect(instantPaymentMethods).toHaveLength(0);
            expect(paymentMethods).toHaveLength(1);
        });

        test('should resolve an unknown displayMode to regular while still honouring a sibling instant', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'INVALID_VALUE' } },
                    { name: 'ApplePay', type: 'applepay', configuration: { displayMode: 'instant' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            expect(instantPaymentMethods.map(pm => pm.type)).toEqual(['applepay']);
            expect(paymentMethods.map(pm => pm.type)).toEqual(['googlepay']);
        });

        test.each([[''], [null]])('should not let the empty "%s" activate custom display mode', displayMode => {
            const parsedPaymentMethods = new PaymentMethods({
                // @ts-ignore Testing a null the interface does not allow but the response can hold
                paymentMethods: [{ name: 'Google Pay', type: 'googlepay', configuration: { displayMode } }]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            expect(instantPaymentMethods).toHaveLength(1);
            expect(paymentMethods).toHaveLength(0);
        });

        test('should activate custom display mode even when only one payment method carries a displayMode', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'instant' } },
                    { name: 'AliPay', type: 'alipay' },
                    { name: 'ApplePay', type: 'applepay' }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['applepay']);

            expect(instantPaymentMethods).toHaveLength(1);
            expect(instantPaymentMethods[0]).toMatchObject({ type: 'googlepay' });
            expect(paymentMethods).toHaveLength(2);
            expect(paymentMethods.map(pm => pm.type)).toEqual(['alipay', 'applepay']);
        });

        test('should keep a fastlane payment method out of the instant area even if displayMode is set as instant', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Fastlane', type: 'fastlane', brands: ['visa'], configuration: { displayMode: 'instant' } },
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'instant' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods, fastlanePaymentMethod } = splitPaymentMethods(parsedPaymentMethods, []);

            expect(fastlanePaymentMethod).toMatchObject({ type: 'fastlane' });
            expect(instantPaymentMethods).toHaveLength(1);
            expect(instantPaymentMethods[0]).toMatchObject({ type: 'googlepay' });
            expect(paymentMethods).toHaveLength(0);
        });

        test('should keep using instantPaymentTypes when configuration carries no displayMode', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { merchantId: 'merchant-id' } },
                    { name: 'AliPay', type: 'alipay' }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            expect(instantPaymentMethods).toHaveLength(1);
            expect(instantPaymentMethods[0]).toMatchObject({ type: 'googlepay' });
            expect(paymentMethods).toHaveLength(1);
        });

        test('should preserve the response order within every category', () => {
            // Interleaved on purpose: neither category is contiguous in the response
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'ApplePay', type: 'applepay', configuration: { displayMode: 'instant' } },
                    { name: 'AliPay', type: 'alipay', configuration: { displayMode: 'regular' } },
                    { name: 'Fastlane', type: 'fastlane', brands: ['visa'] },
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'instant' } },
                    { name: 'KakaoPay', type: 'kakaopay', configuration: { displayMode: 'regular' } },
                    { name: 'Card', type: 'scheme', configuration: { displayMode: 'promoted' } },
                    { name: 'Pay with Google', type: 'paywithgoogle', configuration: { displayMode: 'instant' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods, fastlanePaymentMethod } = splitPaymentMethods(parsedPaymentMethods, []);

            // response positions 0, 3, 6
            expect(instantPaymentMethods.map(pm => pm.type)).toEqual(['applepay', 'googlepay', 'paywithgoogle']);
            // response positions 1, 4, 5 -- 'scheme' is here because it is not an instant-capable type
            expect(paymentMethods.map(pm => pm.type)).toEqual(['alipay', 'kakaopay', 'scheme']);
            expect(fastlanePaymentMethod).toMatchObject({ type: 'fastlane' });
        });
    });
});
