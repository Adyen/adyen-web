import { checkPaymentMethodsResponse } from './utils';

describe('PaymentMethods Utils', () => {
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
