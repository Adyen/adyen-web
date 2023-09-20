import { checkPaymentMethodsResponse } from './utils';

describe('PaymentMethods utils', () => {
    describe('checkPaymentMethodsResponse', () => {
        test('should throw if a wrong format is passed', () => {
            expect(() => checkPaymentMethodsResponse([])).toThrow();
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
