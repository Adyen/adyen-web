import AfterPay from './AfterPay';

describe('AfterPay', () => {
    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const afterPay = new AfterPay();
            expect(afterPay.isValid).toBe(false);
        });
    });

    describe('get data', () => {
        test('returns a type', () => {
            const afterPay = new AfterPay();
            expect(afterPay.data.paymentMethod.type).toBe('afterpay_default');
        });
    });
});
