import RatePay from './RatePay';

describe('RatePay', () => {
    describe('isValid', () => {
        test('returns false if there is no state', () => {
            const ratePay = new RatePay(global.core);
            expect(ratePay.isValid).toBe(false);
        });
    });

    describe('get data', () => {
        test('returns a type', () => {
            const ratePay = new RatePay(global.core);
            expect(ratePay.data.paymentMethod.type).toBe('ratepay');
        });
    });
});
