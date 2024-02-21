import Paypal from './Paypal';

describe('Paypal', () => {
    test('Returns a data object', () => {
        const paypal = new Paypal(global.core);
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: { subtype: 'sdk', type: 'paypal', userAction: 'pay', checkoutAttemptId: 'do-not-track' }
        });
    });

    test('should return subtype express if isExpress flag is set', () => {
        const paypal = new Paypal(global.core, { isExpress: true });
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: { subtype: 'express', type: 'paypal', userAction: 'pay', checkoutAttemptId: 'do-not-track' }
        });
    });

    test('should return userAction=pay as default', () => {
        const paypal = new Paypal({});
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: { subtype: 'sdk', type: 'paypal', userAction: 'pay', checkoutAttemptId: 'do-not-track' }
        });
    });

    test('should return userAction=continue if set', () => {
        const paypal = new Paypal({ isExpress: true, userAction: 'continue' });
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: { subtype: 'express', type: 'paypal', userAction: 'continue', checkoutAttemptId: 'do-not-track' }
        });
    });

    test('Is always valid', () => {
        const paypal = new Paypal(global.core);
        expect(paypal.isValid).toBe(true);
    });

    test('Prevents calling the submit method manually', async () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal(global.core, { onError: onErrorMock });
        await paypal.submit();
        expect(onErrorMock).toHaveBeenCalled();
    });
});

describe('Paypal configuration prop configures correctly', () => {
    test('Paypal element has configuration object with default values', () => {
        const paypal = new Paypal(global.core);
        expect(paypal.props.configuration.merchantId).toEqual('');
        expect(paypal.props.configuration.intent).toEqual(null);
    });

    test('Paypal element has configuration object with values pulled from props.configuration', () => {
        const paypal = new Paypal(global.core, { configuration: { merchantId: 'abcdef', intent: 'order' } });
        expect(paypal.props.configuration.merchantId).toEqual('abcdef');
        expect(paypal.props.configuration.intent).toEqual('order');
    });
});
