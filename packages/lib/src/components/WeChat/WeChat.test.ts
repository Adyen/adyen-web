import WeChat from './WeChat';

describe('WeChat', () => {
    describe('formatProps', () => {});

    describe('isValid', () => {
        test('should be always true', () => {
            const wechat = new WeChat({ core: global.core });
            expect(wechat.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const wechat = new WeChat({ core: global.core });
            expect(wechat.data.paymentMethod.type).toBe('wechatpayQR');
        });
    });

    describe('render', () => {
        test('does render something by default', () => {
            const wechat = new WeChat({ core: global.core });
            expect(wechat.render()).not.toBe(null);
        });
    });
});
