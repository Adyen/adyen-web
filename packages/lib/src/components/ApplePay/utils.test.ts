import { normalizeAmount } from './utils';

describe('Apple Pay utils', () => {
    it('should accept an amount object', () => {
        const props = {
            amount: { value: 1000, currency: 'USD' },
            countryCode: 'DE', // Required. The merchant’s two-letter ISO 3166 country code.

            // Merchant config (required)
            configuration: {
                merchantName: 'Adyen Test merchant', // Name to be displayed
                merchantIdentifier: '12345' // Required. https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951611-merchantidentifier
            }
        };
        expect(normalizeAmount(props)).toEqual({ currency: 'USD', value: 1000 });
    });

    it('should accept a deprecated currencyCode/amount', () => {
        const props = {
            amount: 1000,
            currencyCode: 'USD',
            countryCode: 'DE', // Required. The merchant’s two-letter ISO 3166 country code.

            // Merchant config (required)
            configuration: {
                merchantName: 'Adyen Test merchant', // Name to be displayed
                merchantIdentifier: '12345' // Required. https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951611-merchantidentifier
            }
        };
        // @ts-ignore
        expect(normalizeAmount(props)).toEqual({ currency: 'USD', value: 1000 });
    });
});
