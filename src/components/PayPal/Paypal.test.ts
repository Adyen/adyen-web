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

    test('Paypal element has configuration object but values direct from props are given precedence', () => {
        const paypal = new Paypal({ configuration: { merchantId: 'abcdef', intent: 'order' }, merchantId: '123456', intent: 'capture' });
        expect(paypal.props.configuration.merchantId).toEqual('123456');
        expect(paypal.props.configuration.intent).toEqual('capture');
    });
});
