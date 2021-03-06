import Paypal from './Paypal';

describe('Paypal', () => {
    test('Returns a data object', () => {
        const paypal = new Paypal({});
        expect(paypal.data).toEqual({ clientStateDataIndicator: true, paymentMethod: { subtype: 'sdk', type: 'paypal' } });
    });

    test('Is always valid', () => {
        const paypal = new Paypal({});
        expect(paypal.isValid).toBe(true);
    });

    test('Prevents calling the submit method manually', async () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal({ onError: onErrorMock });
        await paypal.submit();
        expect(onErrorMock).toHaveBeenCalled();
    });
});

describe('Paypal configuration prop configures correctly', () => {
    test('Paypal element has configuration object with default values', () => {
        const paypal = new Paypal({});
        expect(paypal.props.configuration.merchantId).toEqual('');
        expect(paypal.props.configuration.intent).toEqual(null);
    });

    test('Paypal element has configuration object with values pulled from props.configuration', () => {
        const paypal = new Paypal({ configuration: { merchantId: 'abcdef', intent: 'order' } });
        expect(paypal.props.configuration.merchantId).toEqual('abcdef');
        expect(paypal.props.configuration.intent).toEqual('order');
    });
});
