import { filterPresent, filterAvailable } from './filters';

describe('elements filters', () => {
    // describe('filterUnsupported', () => {
    //     test('should return true if the payment method is not unsupported', () => {
    //         expect(filterUnsupported({ type: 'visa' })).toBe(true);
    //     });
    //
    //     test('should return false if the payment method is unsupported', () => {
    //         const unsupportedPaymentMethodType = UNSUPPORTED_PAYMENT_METHODS[0];
    //         expect(filterUnsupported({ type: unsupportedPaymentMethodType })).toBe(false);
    //     });
    // });

    describe('filterPresent', () => {
        test('should return true if the paymentMethod is truthy', () => {
            expect(filterPresent({})).toBe(true);
            expect(filterPresent(true)).toBe(true);
        });

        test('should return false if the paymentMethod is not truthy', () => {
            expect(filterPresent(undefined)).toBe(false);
        });
    });

    describe('filterAvailable', () => {
        test('should return true if the paymentMethod does not implement the isAvailable method', () => {
            filterAvailable({}).then(result => expect(result).toBe(true));
        });

        test('should return true if the paymentMethod is available (promise)', () => {
            filterAvailable({ isAvailable: () => Promise.resolve(true) }).then(isAvailable => {
                expect(isAvailable).toBe(true);
            });
        });

        test('should return false if the paymentMethod is not available (promise)', () => {
            filterAvailable({ isAvailable: () => Promise.reject(false) }).catch(isAvailable => {
                expect(isAvailable).toBe(false);
            });
        });
    });
});
