import BcmcMobile from './BcmcMobile';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('BcmcMobile', () => {
    describe('isValid', () => {
        test('should be always true', () => {
            const core = setupCoreMock();

            const bcmcMobile = new BcmcMobile(core);
            expect(bcmcMobile.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const core = setupCoreMock();

            const bcmcMobile = new BcmcMobile(core);
            expect(bcmcMobile.data.paymentMethod.type).toBe('bcmc_mobile');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const core = setupCoreMock();
            const bcmcMobile = new BcmcMobile(core, { modules: { srPanel: core.modules.srPanel } });
            expect(bcmcMobile.render()).not.toBe(null);
        });
    });
});
