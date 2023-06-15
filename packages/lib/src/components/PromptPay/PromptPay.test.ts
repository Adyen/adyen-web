import PromptPay from './PromptPay';

describe('PromptPay', () => {
    describe('isValid', () => {
        test('should always be true', () => {
            const promptPay = new PromptPay({});
            expect(promptPay.isValid).toBe(true);
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const promptPay = new PromptPay({});
            expect(promptPay.data.paymentMethod.type).toBe('promptpay');
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const promptPay = new PromptPay({});
            expect(promptPay.render()).not.toBe(null);
        });
    });
});
