import Paypal from './Paypal';
import { render, screen } from '@testing-library/preact';

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
        const paypal = new Paypal(global.core);
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: { subtype: 'sdk', type: 'paypal', userAction: 'pay', checkoutAttemptId: 'do-not-track' }
        });
    });

    test('should return userAction=continue if set', () => {
        const paypal = new Paypal(global.core, { isExpress: true, userAction: 'continue' });
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: { subtype: 'express', type: 'paypal', userAction: 'continue', checkoutAttemptId: 'do-not-track' }
        });
    });

    test('Is always valid', () => {
        const paypal = new Paypal(global.core);
        expect(paypal.isValid).toBe(true);
    });

    test('Prevents calling the submit method manually', () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal(global.core, { onError: onErrorMock });
        paypal.submit();
        expect(onErrorMock).toHaveBeenCalled();
    });

    test('should pass the required callbacks to the Component', async () => {
        const paypal = new Paypal(global.core);
        render(paypal.render());

        await screen.findByTestId('paypal-loader');

        // TODO: Implement full integration test mocking the Script loading and PayPal SDK, so we can avoid accessing proceted prop
        // @ts-ignore Accessing protected prop to check that the callbacks are being passed down
        const props = paypal.componentRef.props;

        expect(props.onApprove).toBeDefined();
        expect(props.onCancel).toBeDefined();
        expect(props.onChange).toBeDefined();
        expect(props.onError).toBeDefined();
        expect(props.onScriptLoadFailure).toBeDefined();
        expect(props.onSubmit).toBeDefined();
        expect(props.isExpress).toBeFalsy();
        expect(props.userAction).toBe('pay');
    });
});

describe('Paypal configuration prop configures correctly', () => {
    test('Paypal element has configuration object with default values', () => {
        const paypal = new Paypal(global.core);
        expect(paypal.props.configuration.merchantId).toEqual(undefined);
        expect(paypal.props.configuration.intent).toEqual(undefined);
    });

    test('Paypal element has configuration object with values pulled from props.configuration', () => {
        const paypal = new Paypal(global.core, { configuration: { merchantId: 'abcdef', intent: 'order' } });
        expect(paypal.props.configuration.merchantId).toEqual('abcdef');
        expect(paypal.props.configuration.intent).toEqual('order');
    });
});
