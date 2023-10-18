import Affirm from './Affirm';

describe('Affirm', () => {
    test('returns false if there is no state', () => {
        const affirm = new Affirm({ core: global.core });
        expect(affirm.isValid).toBe(false);
    });

    test('returns a type', () => {
        const affirm = new Affirm({ core: global.core });
        expect(affirm.data.paymentMethod.type).toBe('affirm');
    });
});
