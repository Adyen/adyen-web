import { isReadyToPayRequest, initiatePaymentRequest, getTransactionInfo } from './requests';
import defaultProps from './defaultProps';

describe('Google Pay Requests', () => {
    describe('getTransactionInfo', () => {
        test('should transform a normal currency amount', () => {
            const transactionInfo = getTransactionInfo({ amount: { value: 1234, currency: 'USD' } });

            expect(transactionInfo.currencyCode).toBe('USD');
            expect(transactionInfo.totalPrice).toBe('12.34');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should transform a normal currency with amount ZERO', () => {
            const transactionInfo = getTransactionInfo({ amount: { value: 0, currency: 'EUR' } });

            expect(transactionInfo.currencyCode).toBe('EUR');
            expect(transactionInfo.totalPrice).toBe('0');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should transform a non decimal currency amount', () => {
            const transactionInfo = getTransactionInfo({ amount: { value: 1234, currency: 'JPY' } });

            expect(transactionInfo.currencyCode).toBe('JPY');
            expect(transactionInfo.totalPrice).toBe('1234');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should allow other transactionInfo values', () => {
            const transactionInfo = getTransactionInfo({
                amount: { value: 1234, currency: 'JPY' },
                transactionInfo: {
                    displayItems: [
                        {
                            label: 'Subtotal',
                            type: 'SUBTOTAL',
                            price: '11.00'
                        }
                    ]
                }
            });

            expect(transactionInfo.currencyCode).toBe('JPY');
            expect(transactionInfo.totalPrice).toBe('1234');
            expect(transactionInfo.displayItems).toHaveLength(1);
        });
    });

    describe('initiatePaymentRequest', () => {
        test('should get an initiatePaymentRequest', () => {
            const paymentRequest = initiatePaymentRequest(defaultProps, 'US');

            expect(paymentRequest.allowedPaymentMethods.length).toBeGreaterThan(0);
            expect(paymentRequest.allowedPaymentMethods[0].parameters.allowedAuthMethods).toBe(defaultProps.allowedAuthMethods);
            expect(paymentRequest.apiVersion).toBeDefined();
            expect(paymentRequest.apiVersionMinor).toBeDefined();
        });

        test('should pass merchantOrigin correctly', () => {
            const paymentRequest = initiatePaymentRequest(
                {
                    ...defaultProps,
                    configuration: { ...defaultProps.configuration, merchantOrigin: 'example.com' }
                },
                'US'
            );

            expect(paymentRequest.merchantInfo.merchantOrigin).toBe('example.com');
        });

        test('should not have merchantOrigin when not in use', () => {
            const paymentRequest = initiatePaymentRequest({ ...defaultProps }, 'US');

            // eslint-disable-next-line no-prototype-builtins
            expect(paymentRequest.merchantInfo.hasOwnProperty('merchantOrigin')).toBe(false);
        });
    });

    describe('isReadyToPayRequest', () => {
        test('should get a readyToPayRequest', () => {
            const readyToPayRequest = isReadyToPayRequest(defaultProps);

            expect(readyToPayRequest.allowedPaymentMethods.length).toBeGreaterThan(0);
            expect(readyToPayRequest.apiVersion).toBeDefined();
            expect(readyToPayRequest.apiVersionMinor).toBeDefined();
            expect(readyToPayRequest.existingPaymentMethodRequired).toBe(false);
        });
    });
});
