import DuitNow from './DuitNow';

describe('DuitNow', () => {
    describe('isValid', () => {
        test('should always be true', () => {
            const duitNow = new DuitNow(global.core);
            expect(duitNow.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const duitNow = new DuitNow(global.core);
            expect(duitNow.data.paymentMethod.type).toBe('duitnow');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const duitNow = new DuitNow(global.core);
            expect(duitNow.render()).not.toBe(null);
        });
    });
});
