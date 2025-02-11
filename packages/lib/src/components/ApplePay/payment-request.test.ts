import { preparePaymentRequest } from './payment-request';
import defaultProps from './defaultProps';

describe('preparePaymentRequest', () => {
    test('should warn if country code is missing', () => {
        console.warn = jest.fn();

        preparePaymentRequest({
            countryCode: '',
            companyName: 'Company Name',
            amount: { value: 115800, currency: 'EUR' },
            supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
            totalPriceLabel: 'Amount'
        });

        expect(console.warn).toHaveBeenCalledWith(
            'Apple Pay - Make sure to set the countryCode in the AdyenCheckout configuration or in the Checkout Session creation'
        );
    });

    test('formats the payment object', () => {
        const paymentRequest = preparePaymentRequest({
            countryCode: 'NL',
            companyName: 'Company Name',
            amount: { value: 115800, currency: 'EUR' },
            supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
            totalPriceLabel: 'Amount'
        });

        expect(paymentRequest.total.amount).toBe('1158');
        expect(paymentRequest.total.label).toBe('Amount');
        expect(paymentRequest.countryCode).toBe('NL');
        expect(paymentRequest.supportedNetworks.includes('visa')).toBe(true);
        expect(paymentRequest.currencyCode).toBe('EUR');
    });

    test('formats the payment object with JPY currency (no decimal amount)', () => {
        const paymentRequest = preparePaymentRequest({
            countryCode: 'NL',
            companyName: 'Company Name',
            amount: { value: 115800, currency: 'JPY' },
            totalPriceLabel: 'Amount'
        });
        expect(paymentRequest.total.amount).toBe('115800');
        expect(paymentRequest.total.label).toBe('Amount');
        expect(paymentRequest.countryCode).toBe('NL');
        expect(paymentRequest.currencyCode).toBe('JPY');
    });

    test('formats the payment object with BHD currency (three decimal amount)', () => {
        const paymentRequest = preparePaymentRequest({
            countryCode: 'NL',
            amount: { value: 1158123, currency: 'BHD' },
            companyName: 'Test'
        });

        expect(paymentRequest.total.amount).toBe('1158.123');
        expect(paymentRequest.countryCode).toBe('NL');
        expect(paymentRequest.currencyCode).toBe('BHD');
    });

    describe('defaultProps', () => {
        test('works with defaultProps', () => {
            const paymentRequest = preparePaymentRequest({
                ...defaultProps,
                countryCode: 'US',
                companyName: 'Test'
            });

            expect(paymentRequest.total.amount).toBe('0');
            expect(paymentRequest.total.type).toBe('final');
            expect(paymentRequest.countryCode).toBe('US');
            expect(paymentRequest.currencyCode).toBe('USD');
            expect(paymentRequest.merchantCapabilities[0]).toBe('supports3DS');
            expect(paymentRequest.supportedNetworks.includes('visa')).toBe(true);
        });
    });
});
