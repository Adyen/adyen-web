import { getChargeAmount, getCheckoutLocale, getPayloadJSON } from './utils';

describe('getChargeAmount', () => {
    test('should return the amount in the Amazon format', () => {
        expect(getChargeAmount({ currency: 'EUR', value: 12345 })).toMatchObject({ amount: '123.45', currencyCode: 'EUR' });
        expect(getChargeAmount({ currency: 'GBP', value: 12345 })).toMatchObject({ amount: '123.45', currencyCode: 'GBP' });
        expect(getChargeAmount({ currency: 'JPY', value: 12345 })).toMatchObject({ amount: '12345', currencyCode: 'JPY' });
        expect(getChargeAmount({ currency: 'USD', value: 12345 })).toMatchObject({ amount: '123.45', currencyCode: 'USD' });
    });
});

describe('getCheckoutLocale', () => {
    test('should return the fallback for the passed region if the locale is not supported', () => {
        expect(getCheckoutLocale('en_US', 'EU')).toBe('en_GB');
        expect(getCheckoutLocale('en_GB', 'US')).toBe('en_US');
        expect(getCheckoutLocale('xx_XX', 'EU')).toBe('en_GB');
        expect(getCheckoutLocale('xx_XX', 'US')).toBe('en_US');
    });
});

describe('getPayloadJSON', () => {
    test('should return a paymentDetails object when checkoutMode is ProcessOrder', () => {
        const amount = { currency: 'EUR', value: 1234 };
        const props = {
            configuration: { storeId: '123' }
        };
        expect(getPayloadJSON({ ...props, checkoutMode: 'ProcessOrder' }, amount).paymentDetails).toBeDefined();
        expect(getPayloadJSON({ ...props }, amount).paymentDetails).not.toBeDefined();
    });
});
