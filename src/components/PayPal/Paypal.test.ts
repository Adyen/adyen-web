import Paypal from './Paypal';

describe('Paypal', () => {
    test('Returns a data object', () => {
        const paypal = new Paypal({});
        expect(paypal.data).toEqual({ clientDataIndicator: true, paymentMethod: { subtype: 'sdk', type: 'paypal' } });
    });

    test('Is always valid', () => {
        const paypal = new Paypal({});
        expect(paypal.isValid).toBe(true);
    });
});
