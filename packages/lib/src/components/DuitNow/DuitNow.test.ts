import DuitNow from './DuitNow';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('DuitNow', () => {
    describe('isValid', () => {
        test('should always be true', () => {
            const core = setupCoreMock();

            const duitNow = new DuitNow(core);
            expect(duitNow.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const core = setupCoreMock();

            const duitNow = new DuitNow(core);
            expect(duitNow.data.paymentMethod.type).toBe('duitnow');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const core = setupCoreMock();

            const duitNow = new DuitNow(core, { modules: { srPanel: core.modules.srPanel } });
            expect(duitNow.render()).not.toBe(null);
        });
    });
});
