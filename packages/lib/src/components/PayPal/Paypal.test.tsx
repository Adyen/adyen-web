import Paypal from './Paypal';
import { render, screen } from '@testing-library/preact';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

describe('Paypal', () => {
    test('Returns a data object', () => {
        const paypal = new Paypal(core);
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: {
                subtype: 'sdk',
                type: 'paypal',
                userAction: 'pay',
                checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                sdkData: expect.any(String)
            },
            riskData: { clientData: TEST_RISK_DATA }
        });
    });

    test('should return subtype express if isExpress flag is set', () => {
        const paypal = new Paypal(core, { isExpress: true });
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: {
                subtype: 'express',
                type: 'paypal',
                userAction: 'pay',
                checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                sdkData: expect.any(String)
            },
            riskData: { clientData: TEST_RISK_DATA }
        });
    });

    test('should return userAction=pay as default', () => {
        const paypal = new Paypal(core);
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: {
                subtype: 'sdk',
                type: 'paypal',
                userAction: 'pay',
                checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                sdkData: expect.any(String)
            },
            riskData: { clientData: TEST_RISK_DATA }
        });
    });

    test('should return userAction=continue if set', () => {
        const paypal = new Paypal(core, { isExpress: true, userAction: 'continue' });
        expect(paypal.data).toEqual({
            clientStateDataIndicator: true,
            paymentMethod: {
                subtype: 'express',
                type: 'paypal',
                userAction: 'continue',
                checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                sdkData: expect.any(String)
            },
            riskData: { clientData: TEST_RISK_DATA }
        });
    });

    test('Is always valid', () => {
        const paypal = new Paypal(core);
        expect(paypal.isValid).toBe(true);
    });

    test('Prevents calling the submit method manually', () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal(core, { onError: onErrorMock });
        paypal.submit();
        expect(onErrorMock).toHaveBeenCalled();
    });

    test('should pass the required callbacks to the Component', () => {
        const paypal = new Paypal(core, { onAuthorized: jest.fn() });
        render(paypal.render());
        const props = paypal.props;
        expect(props.onAuthorized).toBeDefined();
        expect(props.isExpress).toBeFalsy();
        expect(props.userAction).toBe('pay');
    });
});

describe('Paypal configuration prop configures correctly', () => {
    test('Paypal element has configuration object with default values', () => {
        const paypal = new Paypal(core);
        expect(paypal.props.configuration?.merchantId).toEqual(undefined);
        expect(paypal.props.configuration?.intent).toEqual(undefined);
    });

    test('Paypal element has configuration object with values pulled from props.configuration', () => {
        const paypal = new Paypal(core, { configuration: { merchantId: 'abcdef', intent: 'order' } });
        expect(paypal.props.configuration?.merchantId).toEqual('abcdef');
        expect(paypal.props.configuration?.intent).toEqual('order');
    });
});

describe('Paypal formatProps', () => {
    test('should set intent to tokenize and vault to true when amount is 0', () => {
        const paypal = new Paypal(core, { amount: { value: 0, currency: 'USD' } });
        expect(paypal.props.configuration?.intent).toBe('tokenize');
        expect(paypal.props.vault).toBe(true);
    });

    test('should use intent from props over configuration intent', () => {
        const paypal = new Paypal(core, { intent: 'capture', configuration: { intent: 'order' } });
        expect(paypal.props.configuration?.intent).toBe('capture');
    });

    test('should set commit to false when userAction is continue', () => {
        const paypal = new Paypal(core, { userAction: 'continue' });
        expect(paypal.props.commit).toBe(false);
    });

    test('should keep commit as true when userAction is pay', () => {
        const paypal = new Paypal(core, { userAction: 'pay' });
        expect(paypal.props.commit).toBe(true);
    });

    test('should set vault to true when intent is tokenize', () => {
        const paypal = new Paypal(core, { intent: 'tokenize' });
        expect(paypal.props.vault).toBe(true);
    });

    test('should set vault based on props.vault when intent is not tokenize', () => {
        const paypal = new Paypal(core, { vault: true, intent: 'capture' });
        expect(paypal.props.vault).toBe(true);
    });
});

describe('Paypal updatePaymentData', () => {
    test('should update paymentData', () => {
        const paypal = new Paypal(core);
        paypal.updatePaymentData('test-payment-data');
        expect(paypal.paymentData).toBe('test-payment-data');
    });

    test('should warn when updating with falsy value', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const paypal = new Paypal(core);
        paypal.updatePaymentData('');
        expect(console.warn).toHaveBeenCalledWith('PayPal - Updating payment data with an invalid value');
    });
});

describe('Paypal updateWithAction', () => {
    test('should throw if action paymentMethodType does not match', () => {
        const paypal = new Paypal(core);
        expect(() => paypal.updateWithAction({ type: 'sdk', paymentMethodType: 'scheme' })).toThrow('Invalid Action');
    });

    test('should store paymentData from action', () => {
        const paypal = new Paypal(core);
        // Set up resolve/reject to avoid WRONG_INSTANCE error
        // @ts-ignore accessing private
        paypal.resolve = jest.fn();
        paypal.updateWithAction({ type: 'sdk', paymentMethodType: 'paypal', paymentData: 'pd-123', sdkData: { token: 'tok-abc' } });
        expect(paypal.paymentData).toBe('pd-123');
    });

    test('should resolve with token when sdkData.token is provided', () => {
        const paypal = new Paypal(core);
        const resolveMock = jest.fn();
        // @ts-ignore accessing private
        paypal.resolve = resolveMock;
        paypal.updateWithAction({ type: 'sdk', paymentMethodType: 'paypal', sdkData: { token: 'test-token' } });
        expect(resolveMock).toHaveBeenCalledWith('test-token');
    });

    test('should reject when sdkData has no token', () => {
        const paypal = new Paypal(core);
        const rejectMock = jest.fn();
        // @ts-ignore accessing private
        paypal.reject = rejectMock;
        paypal.updateWithAction({ type: 'sdk', paymentMethodType: 'paypal', sdkData: {} });
        expect(rejectMock).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should call handleError when resolve is not set and token is provided', () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal(core, { onError: onErrorMock });
        paypal.updateWithAction({ type: 'sdk', paymentMethodType: 'paypal', sdkData: { token: 'test-token' } });
        expect(onErrorMock).toHaveBeenCalled();
    });
});

describe('Paypal handleAction', () => {
    test('should delegate to updateWithAction', () => {
        const paypal = new Paypal(core);
        const spy = jest.spyOn(paypal, 'updateWithAction');
        // @ts-ignore accessing private
        paypal.resolve = jest.fn();
        const action = { type: 'sdk' as const, paymentMethodType: 'paypal', sdkData: { token: 'tok' } };
        paypal.handleAction(action);
        expect(spy).toHaveBeenCalledWith(action);
    });
});

describe('Paypal handleOnApprove', () => {
    test('should call handleAdditionalDetails when onAuthorized is not provided', async () => {
        const onAdditionalDetailsMock = jest.fn();
        const paypal = new Paypal(core, { onAdditionalDetails: onAdditionalDetailsMock });
        paypal.paymentData = 'pd-123';

        const data = { orderID: 'order-1' };
        const actions = { order: { get: jest.fn() } };

        // @ts-ignore accessing private method
        await paypal.handleOnApprove(data, actions);

        expect(onAdditionalDetailsMock).toHaveBeenCalled();
    });

    test('should call handleError when onAuthorized is provided but actions.order is missing', async () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal(core, { onAuthorized: jest.fn(), onError: onErrorMock });

        const data = { orderID: 'order-1' };
        const actions = {};

        // @ts-ignore accessing private method
        await paypal.handleOnApprove(data, actions);

        expect(onErrorMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'PayPal order actions are not available' }), expect.anything());
    });

    test('should get order details and call onAuthorized when provided', async () => {
        const onAuthorizedMock = jest.fn().mockImplementation((_, { resolve }) => resolve());
        const onAdditionalDetailsMock = jest.fn();
        const paypal = new Paypal(core, { onAuthorized: onAuthorizedMock, onAdditionalDetails: onAdditionalDetailsMock });
        paypal.paymentData = 'pd-456';

        const mockOrder = {
            payer: { name: { given_name: 'John', surname: 'Doe' } },
            purchase_units: [{ shipping: { name: { full_name: 'John Doe' } } }]
        };

        const data = { orderID: 'order-1' };
        const actions = { order: { get: jest.fn().mockResolvedValue(mockOrder) } };

        // @ts-ignore accessing private method
        await paypal.handleOnApprove(data, actions);

        expect(actions.order.get).toHaveBeenCalled();
        expect(onAuthorizedMock).toHaveBeenCalledWith(
            expect.objectContaining({ authorizedEvent: mockOrder }),
            expect.objectContaining({ resolve: expect.any(Function), reject: expect.any(Function) })
        );
        expect(onAdditionalDetailsMock).toHaveBeenCalled();
    });

    test('should call handleError when order.get() fails', async () => {
        const onErrorMock = jest.fn();
        const onAuthorizedMock = jest.fn();
        const paypal = new Paypal(core, { onAuthorized: onAuthorizedMock, onError: onErrorMock });

        const data = { orderID: 'order-1' };
        const actions = { order: { get: jest.fn().mockRejectedValue(new Error('Order fetch failed')) } };

        // @ts-ignore accessing private method
        await paypal.handleOnApprove(data, actions);

        expect(onErrorMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Something went wrong while parsing PayPal Order' }),
            expect.anything()
        );
    });
});

describe('Paypal handleReject', () => {
    test('should call handleError when reject is not set', () => {
        const onErrorMock = jest.fn();
        const paypal = new Paypal(core, { onError: onErrorMock });
        paypal.handleReject('some error');
        expect(onErrorMock).toHaveBeenCalled();
    });
});

describe('Paypal shipping change handlers', () => {
    test('handleOnShippingAddressChange should call the merchant callback', async () => {
        const onShippingAddressChangeMock = jest.fn().mockResolvedValue(undefined);
        const paypal = new Paypal(core, { onShippingAddressChange: onShippingAddressChangeMock });

        const data = { shippingAddress: { city: 'Amsterdam' } };
        const actions = { reject: jest.fn() };

        // @ts-ignore accessing private method
        await paypal.handleOnShippingAddressChange(data, actions);

        expect(onShippingAddressChangeMock).toHaveBeenCalledWith(data, actions, paypal);
    });

    test('handleOnShippingAddressChange should resolve when no callback provided', async () => {
        const paypal = new Paypal(core);
        // @ts-ignore accessing private method
        const result = await paypal.handleOnShippingAddressChange({}, {});
        expect(result).toBeUndefined();
    });

    test('handleOnShippingOptionsChange should call the merchant callback', async () => {
        const onShippingOptionsChangeMock = jest.fn().mockResolvedValue(undefined);
        const paypal = new Paypal(core, { onShippingOptionsChange: onShippingOptionsChangeMock });

        const data = { selectedShippingOption: { id: 'option-1' } };
        const actions = { reject: jest.fn() };

        // @ts-ignore accessing private method
        await paypal.handleOnShippingOptionsChange(data, actions);

        expect(onShippingOptionsChangeMock).toHaveBeenCalledWith(data, actions, paypal);
    });

    test('handleOnShippingOptionsChange should resolve when no callback provided', async () => {
        const paypal = new Paypal(core);
        // @ts-ignore accessing private method
        const result = await paypal.handleOnShippingOptionsChange({}, {});
        expect(result).toBeUndefined();
    });
});

describe('Paypal componentToRender', () => {
    test('should not render PayPal buttons when showPayButton is false', () => {
        const paypal = new Paypal(core, { showPayButton: false });
        render(paypal.render());
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    test('should render component when showPayButton is true', () => {
        const paypal = new Paypal(core, { showPayButton: true });
        render(paypal.render());
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    test('should pass onShippingAddressChange handler when callback is provided', () => {
        const paypal = new Paypal(core, { showPayButton: true, onShippingAddressChange: jest.fn() });
        render(paypal.render());
        expect(paypal.props.onShippingAddressChange).toBeDefined();
    });

    test('should pass onShippingOptionsChange handler when callback is provided', () => {
        const paypal = new Paypal(core, { showPayButton: true, onShippingOptionsChange: jest.fn() });
        render(paypal.render());
        expect(paypal.props.onShippingOptionsChange).toBeDefined();
    });
});
