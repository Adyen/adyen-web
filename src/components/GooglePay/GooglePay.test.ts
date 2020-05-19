import GooglePay from './GooglePay';

describe('GooglePay', () => {
    describe('get data', () => {
        test('always returns a type', () => {
            const gpay = new GooglePay({});
            expect(gpay.data.paymentMethod.type).toBe('paywithgoogle');
        });
    });
});
