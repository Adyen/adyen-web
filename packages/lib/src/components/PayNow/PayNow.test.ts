import PayNow from './PayNow';

describe('PayNow', () => {
    describe('isValid', () => {
        test('should be always true', () => {
            const paynow = new PayNow({ core: global.core });
            expect(paynow.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const paynow = new PayNow({ core: global.core });
            expect(paynow.data.paymentMethod.type).toBe('paynow');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const paynow = new PayNow({ core: global.core });
            expect(paynow.render()).not.toBe(null);
        });
    });
});
