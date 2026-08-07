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

    describe('backend driven displayMode', () => {
        test('should treat a payment method marked instant by the backend as instant, without instantPaymentTypes', () => {
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

        test('should ignore instantPaymentTypes entirely once the backend has expressed an intent', () => {
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

        test('should render no instant payment methods when the backend only sends regular', () => {
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

        test('should not surface a non-supported payment method in the instant area', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [{ name: 'PayPal', type: 'paypal', configuration: { displayMode: 'instant' } }]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, []);

            expect(instantPaymentMethods).toHaveLength(0);
            expect(paymentMethods).toHaveLength(1);
            expect(paymentMethods[0]).toMatchObject({ type: 'paypal' });
        });

        test.each([['promoted'], ['INSTANT'], ['something-new'], ['stored'], ['fastlane']])(
            'should fall back to regular for the unknown displayMode "%s"',
            displayMode => {
                const parsedPaymentMethods = new PaymentMethods({
                    paymentMethods: [{ name: 'Google Pay', type: 'googlepay', configuration: { displayMode } }]
                });

                const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

                // any displayMode hands the decision to the response, so instantPaymentTypes no longer applies
                expect(instantPaymentMethods).toHaveLength(0);
                expect(paymentMethods).toHaveLength(1);
            }
        );

        test('should resolve an unknown displayMode to regular while still honouring a sibling instant', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 'promoted' } },
                    { name: 'ApplePay', type: 'applepay', configuration: { displayMode: 'instant' } }
                ]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            expect(instantPaymentMethods.map(pm => pm.type)).toEqual(['applepay']);
            expect(paymentMethods.map(pm => pm.type)).toEqual(['googlepay']);
        });

        test.each([[''], [null]])('should not let the empty displayMode "%s" hand control to the response', displayMode => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [{ name: 'Google Pay', type: 'googlepay', configuration: { displayMode } }]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, ['googlepay']);

            expect(instantPaymentMethods).toHaveLength(1);
            expect(paymentMethods).toHaveLength(0);
        });

        test('should not compare a non-string displayMode against "instant"', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [{ name: 'Google Pay', type: 'googlepay', configuration: { displayMode: 42 as unknown as string } }]
            });

            const { paymentMethods, instantPaymentMethods } = splitPaymentMethods(parsedPaymentMethods, []);

            expect(instantPaymentMethods).toHaveLength(0);
            expect(paymentMethods).toHaveLength(1);
        });

        test('should let the backend control the whole list even when only one payment method carries a displayMode', () => {
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

        test('should keep a fastlane payment method out of the instant area even when the backend marks it instant', () => {
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

        test('should keep the first fastlane entry when the response contains more than one', () => {
            const parsedPaymentMethods = new PaymentMethods({
                paymentMethods: [
                    { name: 'Fastlane A', type: 'fastlane', brands: ['visa'] },
                    { name: 'Fastlane B', type: 'fastlane', brands: ['mc'] },
                    { name: 'AliPay', type: 'alipay', configuration: { displayMode: 'regular' } }
                ]
            });

            const { paymentMethods, fastlanePaymentMethod } = splitPaymentMethods(parsedPaymentMethods, []);

            expect(fastlanePaymentMethod).toMatchObject({ name: 'Fastlane A' });
            // both fastlane entries stay out of the regular list
            expect(paymentMethods.map(pm => pm.type)).toEqual(['alipay']);
        });
    });
});
