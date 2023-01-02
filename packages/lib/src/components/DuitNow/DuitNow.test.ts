import DuitNow from './DuitNow';

describe('DuitNow', () => {
    describe('isValid', () => {
        test('should always be true', () => {
            const duitNow = new DuitNow({});
            expect(duitNow.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const duitNow = new DuitNow({});
            expect(duitNow.data.paymentMethod.type).toBe('duitnow');
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const duitNow = new DuitNow({});
            expect(duitNow.render()).toBe(null);
        });
    });
});
