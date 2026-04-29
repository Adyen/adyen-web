import {
    filterAllowedPaymentMethods,
    filterRemovedPaymentMethods,
    filterEcomStoredPaymentMethods,
    filterSupportedStoredPaymentMethods
} from './filters';

describe('PaymentMethods filters', () => {
    describe('filterAllowedPaymentMethods', () => {
        test('should return true when payment method type is in the allowed list', () => {
            const filter = filterAllowedPaymentMethods.bind(['ideal', 'scheme']);
            expect(filter({ type: 'ideal' })).toBe(true);
            expect(filter({ type: 'scheme' })).toBe(true);
        });

        test('should return false when payment method type is not in the allowed list', () => {
            const filter = filterAllowedPaymentMethods.bind(['ideal', 'scheme']);
            expect(filter({ type: 'paypal' })).toBe(false);
        });

        test('should return true for any payment method when allow list is empty', () => {
            const filter = filterAllowedPaymentMethods.bind([]);
            expect(filter({ type: 'ideal' })).toBe(true);
            expect(filter({ type: 'paypal' })).toBe(true);
        });
    });

    describe('filterRemovedPaymentMethods', () => {
        test('should return false when payment method type is in the removed list', () => {
            const filter = filterRemovedPaymentMethods.bind(['ideal', 'scheme']);
            expect(filter({ type: 'ideal' })).toBe(false);
            expect(filter({ type: 'scheme' })).toBe(false);
        });

        test('should return true when payment method type is not in the removed list', () => {
            const filter = filterRemovedPaymentMethods.bind(['ideal', 'scheme']);
            expect(filter({ type: 'paypal' })).toBe(true);
        });

        test('should return true for any payment method when removed list is empty', () => {
            const filter = filterRemovedPaymentMethods.bind([]);
            expect(filter({ type: 'ideal' })).toBe(true);
            expect(filter({ type: 'paypal' })).toBe(true);
        });
    });

    test('filterEcomStoredPaymentMethods', () => {
        expect(filterEcomStoredPaymentMethods({ supportedShopperInteractions: ['SomeInteraction'] })).toBe(false);
        expect(filterEcomStoredPaymentMethods({ supportedShopperInteractions: ['Ecommerce'] })).toBe(true);
        expect(filterEcomStoredPaymentMethods({ supportedShopperInteractions: undefined })).toBe(false);
        expect(filterEcomStoredPaymentMethods({})).toBe(false);
        expect(filterEcomStoredPaymentMethods(null)).toBe(false);
    });

    test('filterSupportedStoredPaymentMethods', () => {
        expect(filterSupportedStoredPaymentMethods({ type: 'ideal' })).toBe(false);
        expect(filterSupportedStoredPaymentMethods({ type: 'scheme' })).toBe(true);
        expect(filterSupportedStoredPaymentMethods({ type: undefined })).toBe(false);
        expect(filterSupportedStoredPaymentMethods({})).toBe(false);
        expect(filterSupportedStoredPaymentMethods(null)).toBe(false);
    });
});
