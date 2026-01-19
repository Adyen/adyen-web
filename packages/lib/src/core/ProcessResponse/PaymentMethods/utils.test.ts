import { checkPaymentMethodsResponse, processStoredPaymentMethods } from './utils';

describe('PaymentMethods Utils', () => {
    describe('processStoredPaymentMethods', () => {
        const storedPaymentMethods = [
            {
                id: 'stored-visa-1',
                type: 'scheme',
                brand: 'visa',
                lastFour: '1111',
                expiryMonth: '03',
                expiryYear: '30',
                holderName: 'Test',
                name: 'VISA',
                supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
                supportedRecurringProcessingModels: ['CardOnFile']
            },
            {
                id: 'stored-mc-voucher-1',
                type: 'scheme',
                brand: 'mc_voucher_br',
                lastFour: '0002',
                expiryMonth: '03',
                expiryYear: '30',
                holderName: 'Test',
                name: 'mc_voucher_br',
                supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
                supportedRecurringProcessingModels: ['CardOnFile']
            },
            {
                id: 'stored-maestro-1',
                type: 'scheme',
                brand: 'maestro',
                lastFour: '0029',
                expiryMonth: '03',
                expiryYear: '30',
                holderName: 'Test',
                name: 'Maestro',
                supportedShopperInteractions: ['Ecommerce', 'ContAuth'],
                supportedRecurringProcessingModels: ['CardOnFile']
            }
        ];

        const paymentMethods = [
            {
                type: 'scheme',
                name: 'Credit Card',
                fundingSource: 'credit' as const,
                brands: ['visa', 'mc', 'amex']
            },
            {
                type: 'scheme',
                name: 'Debit Card',
                fundingSource: 'debit' as const,
                brands: ['maestro', 'visa_debit']
            },
            {
                type: 'scheme',
                name: 'Meal Voucher',
                fundingSource: 'prepaid' as const,
                brands: ['mc_voucher_br', 'visa_voucher_br', 'elo_voucher_br']
            }
        ];

        test('should add fundingSource to stored card when brand matches a payment method', () => {
            const result = processStoredPaymentMethods(storedPaymentMethods, {}, paymentMethods);

            const visaCard = result.find(pm => pm.id === 'stored-visa-1');
            expect(visaCard?.fundingSource).toBe('credit');
        });

        test('should add fundingSource "prepaid" to stored meal voucher card', () => {
            const result = processStoredPaymentMethods(storedPaymentMethods, {}, paymentMethods);

            const voucherCard = result.find(pm => pm.id === 'stored-mc-voucher-1');
            expect(voucherCard?.fundingSource).toBe('prepaid');
        });

        test('should add fundingSource "debit" to stored debit card', () => {
            const result = processStoredPaymentMethods(storedPaymentMethods, {}, paymentMethods);

            const maestroCard = result.find(pm => pm.id === 'stored-maestro-1');
            expect(maestroCard?.fundingSource).toBe('debit');
        });

        test('should not add fundingSource when no matching payment method is found', () => {
            const storedWithUnknownBrand = [
                {
                    id: 'stored-unknown-1',
                    type: 'scheme',
                    brand: 'unknown_brand',
                    lastFour: '9999',
                    expiryMonth: '03',
                    expiryYear: '30',
                    holderName: 'Test',
                    name: 'Unknown',
                    supportedShopperInteractions: ['Ecommerce'],
                    supportedRecurringProcessingModels: ['CardOnFile']
                }
            ];

            const result = processStoredPaymentMethods(storedWithUnknownBrand, {}, paymentMethods);

            expect(result[0]?.fundingSource).toBeUndefined();
        });

        test('should not add fundingSource for non-scheme stored payment methods', () => {
            const storedPayPal = [
                {
                    id: 'stored-paypal-1',
                    type: 'paypal',
                    name: 'PayPal',
                    supportedShopperInteractions: ['Ecommerce'],
                    supportedRecurringProcessingModels: ['CardOnFile']
                }
            ];

            const result = processStoredPaymentMethods(storedPayPal, {}, paymentMethods);

            expect(result[0]?.fundingSource).toBeUndefined();
        });

        test('should work when paymentMethods array is empty', () => {
            const result = processStoredPaymentMethods(storedPaymentMethods, {}, []);

            expect(result.length).toBe(3);
            result.forEach(pm => {
                expect(pm.fundingSource).toBeUndefined();
            });
        });

        test('should work when paymentMethods parameter is not provided (backward compatibility)', () => {
            const result = processStoredPaymentMethods(storedPaymentMethods, {});

            expect(result.length).toBe(3);
            result.forEach(pm => {
                expect(pm.fundingSource).toBeUndefined();
            });
        });
    });

    describe('checkPaymentMethodsResponse', () => {
        test('should throw if a wrong format is passed', () => {
            // @ts-ignore Testing if merchant passes the wrong parameter
            expect(() => checkPaymentMethodsResponse([])).toThrow();
            // @ts-ignore Testing if merchant passes the wrong parameter
            expect(() => checkPaymentMethodsResponse('{}')).toThrow();
        });

        test('should show a warning if no payment methods are found', () => {
            console.warn = jest.fn();
            checkPaymentMethodsResponse({});
            checkPaymentMethodsResponse({ paymentMethods: [] });
            expect((console.warn as any).mock.calls.length).toBe(2);
        });
    });
});
