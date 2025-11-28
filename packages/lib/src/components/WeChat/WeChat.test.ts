import WeChat from './WeChat';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('WeChat', () => {
    describe('isValid', () => {
        test('should be always true', () => {
            const core = setupCoreMock();
            const wechat = new WeChat(core);
            expect(wechat.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const core = setupCoreMock();
            const wechat = new WeChat(core);
            expect(wechat.data.paymentMethod.type).toBe('wechatpayQR');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const core = setupCoreMock();
            const wechat = new WeChat(core, { modules: { srPanel: core.modules.srPanel } });
            expect(wechat.render()).not.toBe(null);
        });
    });
});
