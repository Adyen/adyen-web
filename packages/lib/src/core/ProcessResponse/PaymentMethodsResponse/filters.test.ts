import { filterEcomStoredPaymentMethods, filterSupportedStoredPaymentMethods } from './filters';

describe('PaymentMethodsResponse filters', () => {
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
