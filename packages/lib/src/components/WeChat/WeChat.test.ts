import WeChat from './WeChat';

describe('WeChat', () => {
    describe('formatProps', () => {});

    describe('isValid', () => {
        test('should be always true', () => {
            const wechat = new WeChat({});
            expect(wechat.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const wechat = new WeChat({});
            expect(wechat.data.paymentMethod.type).toBe('wechatpayQR');
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const wechat = new WeChat({});
            expect(wechat.render()).not.toBe(null);
        });
    });
});
