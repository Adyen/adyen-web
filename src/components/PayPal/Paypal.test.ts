import Paypal from './Paypal';

describe('Paypal', () => {
    test('Returns a data object', () => {
        const paypal = new Paypal({});
        expect(paypal.data).toEqual({ paymentMethod: { subtype: 'sdk', type: 'paypal' } });
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
        expect(paypal.props.configuration.intent).toEqual('capture');
    });

    test('Paypal element has configuration object with a props defined values ', () => {
        const paypal = new Paypal({ merchantId: '12345', intent: 'sale' });
        expect(paypal.props.configuration.merchantId).toEqual('12345');
        expect(paypal.props.configuration.intent).toEqual('sale');
    });

    test('Paypal element has configuration object with a configuration defined values', () => {
        const paypal = new Paypal({ merchantId: '12345', intent: 'sale', configuration: { merchantId: 'abcdef', intent: 'order' } });
        expect(paypal.props.configuration.merchantId).toEqual('abcdef');
        expect(paypal.props.configuration.intent).toEqual('order');
    });

    test('Paypal element has configuration object with a PMs.configuration defined values', () => {
        const paypal = new Paypal({
            merchantId: '12345',
            intent: 'sale',
            configuration: { merchantId: 'abcdef', intent: 'order' },
            paymentMethods: [{ type: Paypal.type, name: 'paypal', configuration: { merchantId: 'qwerty', intent: 'authorize' } }]
        });
        expect(paypal.props.configuration.merchantId).toEqual('qwerty');
        expect(paypal.props.configuration.intent).toEqual('authorize');
    });
});
