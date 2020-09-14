import AfterPay from './AfterPay';

describe('AfterPay', () => {
    test('returns false if there is no state', () => {
        const afterPay = new AfterPay({});
        expect(afterPay.isValid).toBe(false);
    });

    test('returns a type', () => {
        const afterPay = new AfterPay({});
        expect(afterPay.data.paymentMethod.type).toBe('afterpay_default');
    });
});
