import PromptPay from './PromptPay';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('PromptPay', () => {
    describe('isValid', () => {
        test('should always be true', () => {
            const promptPay = new PromptPay(global.core);
            expect(promptPay.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const promptPay = new PromptPay(global.core);
            expect(promptPay.data.paymentMethod.type).toBe('promptpay');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const core = setupCoreMock();
            const promptPay = new PromptPay(core, { modules: { srPanel: core.modules.srPanel } });
            expect(promptPay.render()).not.toBe(null);
        });
    });
});
