import BcmcMobile from './BcmcMobile';

describe('BcmcMobile', () => {
    describe('formatProps', () => {});

    describe('isValid', () => {
        test('should be always true', () => {
            const bcmcMobile = new BcmcMobile({});
            expect(bcmcMobile.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const bcmcMobile = new BcmcMobile({});
            expect(bcmcMobile.data.paymentMethod.type).toBe('bcmc_mobile');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const bcmcMobile = new BcmcMobile({});
            expect(bcmcMobile.render()).not.toBe(null);
        });
    });
});
