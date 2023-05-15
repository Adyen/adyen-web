import PayNow from './PayNow';

describe('PayNow', () => {
    describe('isValid', () => {
        test('should be always true', () => {
            const paynow = new PayNow({});
            expect(paynow.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const paynow = new PayNow({});
            expect(paynow.data.paymentMethod.type).toBe('paynow');
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const paynow = new PayNow({});
            expect(paynow.render()).toBe(null);
        });
    });
});
