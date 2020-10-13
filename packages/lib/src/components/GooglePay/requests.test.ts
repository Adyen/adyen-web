import { isReadyToPayRequest, initiatePaymentRequest, getTransactionInfo } from './requests';
import defaultProps from './defaultProps';

describe('Google Pay Requests', () => {
    describe('getTransactionInfo', () => {
        test('should transform a normal currency amount', () => {
            const transactionInfo = getTransactionInfo({ currencyCode: 'USD', totalPrice: 1234 });

            expect(transactionInfo.currencyCode).toBe('USD');
            expect(transactionInfo.totalPrice).toBe('12.34');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should transform a normal currency with amount ZERO', () => {
            const transactionInfo = getTransactionInfo({ currencyCode: 'EUR', totalPrice: 0 });

            expect(transactionInfo.currencyCode).toBe('EUR');
            expect(transactionInfo.totalPrice).toBe('0');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should default to a ZERO amount', () => {
            const transactionInfo = getTransactionInfo({});

            expect(transactionInfo.currencyCode).toBe('USD');
            expect(transactionInfo.totalPrice).toBe('0');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should transform a non decimal currency amount', () => {
            const transactionInfo = getTransactionInfo({ currencyCode: 'JPY', totalPrice: 1234 });

            expect(transactionInfo.currencyCode).toBe('JPY');
            expect(transactionInfo.totalPrice).toBe('1234');
            expect(transactionInfo.totalPriceStatus).toBe('FINAL');
        });

        test('should allow other transactionInfo values', () => {
            const transactionInfo = getTransactionInfo({
                currencyCode: 'JPY',
                totalPrice: 1234,
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
            const paymentRequest = initiatePaymentRequest(defaultProps);

            expect(paymentRequest.allowedPaymentMethods.length).toBeGreaterThan(0);
            expect(paymentRequest.allowedPaymentMethods[0].parameters.allowedAuthMethods).toBe(defaultProps.allowedAuthMethods);
            expect(paymentRequest.apiVersion).toBeDefined();
            expect(paymentRequest.apiVersionMinor).toBeDefined();
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
