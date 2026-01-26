import PromptPay from './PromptPay';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { ICore } from '../../types';

describe('PromptPay', () => {
    let core: ICore;

    beforeEach(() => {
        core = setupCoreMock();
    });

    describe('isValid', () => {
        test('should always be true', () => {
            const promptPay = new PromptPay(core);
            expect(promptPay.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const promptPay = new PromptPay(core);
            expect(promptPay.data.paymentMethod.type).toBe('promptpay');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const promptPay = new PromptPay(core);
            expect(promptPay.render()).not.toBe(null);
        });
    });
});
