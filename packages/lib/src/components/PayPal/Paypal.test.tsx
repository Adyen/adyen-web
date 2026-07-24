import Paypal from './Paypal';
import { render, screen } from '@testing-library/preact';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';
import CancelError from '../../core/Errors/CancelError';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { PayPalService } from './services/PayPalService';
import { PayPalSdkLoader } from './services/PayPalSdkLoader';
import type { PayPalEligiblePaymentMethods } from './paypal-js-types';
import type { PayPalComponentV6Props } from './components/types';

jest.mock('./services/PayPalService');
jest.mock('./services/PayPalSdkLoader');

const mockPayPalComponentV6 = jest.fn();
jest.mock('./components/PaypalComponentV6', () => ({
    PayPalComponentV6: (props: PayPalComponentV6Props) => {
        mockPayPalComponentV6(props);
        return null;
    }
}));

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;
const PayPalSdkLoaderMock = PayPalSdkLoader as jest.MockedClass<typeof PayPalSdkLoader>;

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
        expect(onErrorMock).toHaveBeenCalledWith(expect.any(AdyenCheckoutError), expect.anything());
    });

    test('should pass the required callbacks to the Component', () => {
        const paypal = new Paypal(core, { onAuthorized: jest.fn() });
        render(paypal.render());
        const props = paypal.props;
        expect(props.onAuthorized).toBeDefined();
        expect(props.isExpress).toBeFalsy();
        expect(props.userAction).toBe('pay');
    });

    describe('configuration prop configures correctly', () => {
        test('element has configuration object with default values', () => {
            const paypal = new Paypal(core);
            expect(paypal.props.configuration?.merchantId).toEqual(undefined);
            expect(paypal.props.configuration?.intent).toEqual(undefined);
        });

        test('element has configuration object with values pulled from props.configuration', () => {
            const paypal = new Paypal(core, { configuration: { merchantId: 'abcdef', intent: 'order' } });
            expect(paypal.props.configuration?.merchantId).toEqual('abcdef');
            expect(paypal.props.configuration?.intent).toEqual('order');
        });
    });

    describe('formatProps', () => {
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

        test('should not set usePayPalV6 when it is not provided', () => {
            const paypal = new Paypal(core);
            expect(paypal.props.usePayPalV6).toBeUndefined();
        });
    });

    describe('updatePaymentData', () => {
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

    describe('updateWithAction', () => {
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
            expect(onErrorMock).toHaveBeenCalledWith(expect.any(AdyenCheckoutError), expect.anything());
        });
    });

    describe('handleAction', () => {
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

    describe('handleOnApprove', () => {
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

            expect(onErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'PayPal order actions are not available' }),
                expect.anything()
            );
            expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
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
            expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
        });
    });

    describe('handleReject', () => {
        test('should call handleError when reject is not set', () => {
            const onErrorMock = jest.fn();
            const paypal = new Paypal(core, { onError: onErrorMock });
            paypal.handleReject('some error');
            expect(onErrorMock).toHaveBeenCalledWith(expect.any(AdyenCheckoutError), expect.anything());
        });
    });

    describe('shipping change handlers', () => {
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

    describe('handleSubmit', () => {
        test('should call onPaymentFailed and reject when makePaymentsCall fails with a non-cancel error', async () => {
            const onPaymentFailedMock = jest.fn();
            const failedResponse = { resultCode: 'Refused' };

            const onSubmitMock = jest.fn().mockImplementation((_data, _component, actions) => {
                actions.resolve(failedResponse);
            });

            const paypal = new Paypal(core, { onSubmit: onSubmitMock, onPaymentFailed: onPaymentFailedMock });

            // @ts-ignore accessing private method
            const submitPromise = paypal.handleSubmit();

            await new Promise(process.nextTick);

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentFailedMock).toHaveBeenCalledWith({ resultCode: 'Refused' }, paypal);
            await expect(submitPromise).rejects.toThrow('Something went wrong during PayPal payment: {"resultCode":"Refused"}');
        });

        test('should include the Error message in the rejection when makePaymentsCall rejects with an Error', async () => {
            const onPaymentFailedMock = jest.fn();

            const onSubmitMock = jest.fn().mockImplementation((_data, _component, actions) => {
                actions.reject(new Error('Network timeout'));
            });

            const paypal = new Paypal(core, { onSubmit: onSubmitMock, onPaymentFailed: onPaymentFailedMock });

            // @ts-ignore accessing private method
            const submitPromise = paypal.handleSubmit();

            await new Promise(process.nextTick);

            await expect(submitPromise).rejects.toThrow('Something went wrong during PayPal payment: Network timeout');
        });

        test('should stringify non-Error values in the rejection message', async () => {
            const onPaymentFailedMock = jest.fn();
            const failedResponse = { resultCode: 'Refused' };

            const onSubmitMock = jest.fn().mockImplementation((_data, _component, actions) => {
                actions.resolve(failedResponse);
            });

            const paypal = new Paypal(core, { onSubmit: onSubmitMock, onPaymentFailed: onPaymentFailedMock });

            // @ts-ignore accessing private method
            const submitPromise = paypal.handleSubmit();

            await new Promise(process.nextTick);

            await expect(submitPromise).rejects.toThrow('Something went wrong during PayPal payment: {"resultCode":"Refused"}');
        });

        test('should set status to ready and not call onPaymentFailed when makePaymentsCall fails with CancelError', async () => {
            const onPaymentFailedMock = jest.fn();

            const onSubmitMock = jest.fn().mockImplementation((_data, _component, actions) => {
                actions.reject(new CancelError('cancelled'));
            });

            const paypal = new Paypal(core, { onSubmit: onSubmitMock, onPaymentFailed: onPaymentFailedMock });
            const setStatusSpy = jest.spyOn(paypal, 'setElementStatus');

            // @ts-ignore accessing private method
            const submitPromise = paypal.handleSubmit();

            await new Promise(process.nextTick);

            expect(setStatusSpy).toHaveBeenCalledWith('ready');
            expect(onPaymentFailedMock).not.toHaveBeenCalled();

            // Promise should remain pending (never resolved/rejected) for CancelError
            const raceResult = await Promise.race([submitPromise.then(() => 'resolved').catch(() => 'rejected'), Promise.resolve('pending')]);
            expect(raceResult).toBe('pending');
        });
    });

    describe('componentToRender', () => {
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

    describe('PayPal v6', () => {
        const isEligibleMock = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
            PayPalServiceMock.prototype.initialize.mockResolvedValue(undefined);
            PayPalServiceMock.prototype.isSdkLoaded.mockResolvedValue(undefined);
            PayPalServiceMock.prototype.getEligiblePaymentMethods.mockReturnValue({
                isEligible: isEligibleMock
            } as unknown as PayPalEligiblePaymentMethods);
            isEligibleMock.mockReturnValue(true);
        });

        describe('constructor', () => {
            test('should create the SDK loader and PayPal service and initialize it when usePayPalV6 is set', () => {
                new Paypal(core, {
                    usePayPalV6: { vault: true, nonce: 'test-nonce' },
                    configuration: { merchantId: 'merchant-1' },
                    countryCode: 'US',
                    amount: { value: 1000, currency: 'USD' }
                });

                expect(PayPalSdkLoaderMock).toHaveBeenCalledTimes(1);
                expect(PayPalSdkLoaderMock).toHaveBeenCalledWith(expect.objectContaining({ nonce: 'test-nonce' }));

                expect(PayPalServiceMock).toHaveBeenCalledTimes(1);
                expect(PayPalServiceMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        merchantId: 'merchant-1',
                        countryCode: 'US',
                        amount: { value: 1000, currency: 'USD' },
                        vault: true,
                        sdkLoader: expect.any(PayPalSdkLoader)
                    })
                );

                expect(PayPalServiceMock.prototype.initialize).toHaveBeenCalledTimes(1);
            });

            test('should default vault to false when not provided in usePayPalV6', () => {
                new Paypal(core, { usePayPalV6: {} });

                expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ vault: false }));
            });

            test('should not create the SDK loader or PayPal service when usePayPalV6 is not set', () => {
                new Paypal(core);

                expect(PayPalSdkLoaderMock).not.toHaveBeenCalled();
                expect(PayPalServiceMock).not.toHaveBeenCalled();
                expect(PayPalServiceMock.prototype.initialize).not.toHaveBeenCalled();
            });

            test('should report the error via onError when initialization fails', async () => {
                const initError = new Error('Failed to load token');
                PayPalServiceMock.prototype.initialize.mockRejectedValue(initError);
                const onErrorMock = jest.fn();

                new Paypal(core, { usePayPalV6: {}, onError: onErrorMock });

                await new Promise(resolve => setTimeout(resolve, 0));

                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
                expect(onErrorMock.mock.calls[0][0]).toMatchObject({
                    message: 'Something went wrong while initializing PayPal',
                    cause: initError
                });
            });

            test('should forward an AdyenCheckoutError as-is when initialization fails', async () => {
                const initError = new AdyenCheckoutError('NETWORK_ERROR', 'PayPal token request failed');
                PayPalServiceMock.prototype.initialize.mockRejectedValue(initError);
                const onErrorMock = jest.fn();

                new Paypal(core, { usePayPalV6: {}, onError: onErrorMock });

                await new Promise(resolve => setTimeout(resolve, 0));

                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock).toHaveBeenCalledWith(initError, expect.anything());
            });
        });

        describe('isAvailable', () => {
            test('should resolve without using the PayPal service when usePayPalV6 is not set', async () => {
                const paypal = new Paypal(core);

                await expect(paypal.isAvailable()).resolves.toBeUndefined();
                expect(PayPalServiceMock.prototype.isSdkLoaded).not.toHaveBeenCalled();
            });

            test('should wait for the SDK and resolve when PayPal is eligible', async () => {
                isEligibleMock.mockReturnValue(true);
                const paypal = new Paypal(core, { usePayPalV6: {} });

                await expect(paypal.isAvailable()).resolves.toBeUndefined();

                expect(PayPalServiceMock.prototype.isSdkLoaded).toHaveBeenCalledTimes(1);
                expect(isEligibleMock).toHaveBeenCalledWith('paypal');
            });

            test('should reject when PayPal is not eligible', async () => {
                isEligibleMock.mockReturnValue(false);
                const paypal = new Paypal(core, { usePayPalV6: {} });

                await expect(paypal.isAvailable()).rejects.toThrow('PayPal is not available');
                await expect(paypal.isAvailable()).rejects.toBeInstanceOf(AdyenCheckoutError);
            });

            test('should reject when the SDK fails to load', async () => {
                PayPalServiceMock.prototype.isSdkLoaded.mockRejectedValue(new Error('PayPal SDK not loaded'));
                const paypal = new Paypal(core, { usePayPalV6: {} });

                await expect(paypal.isAvailable()).rejects.toThrow('PayPal SDK not loaded');
                expect(isEligibleMock).not.toHaveBeenCalled();
            });
        });

        describe('handleOnApproveV6', () => {
            test('should call handleAdditionalDetails with the approve data and the stored paymentData', async () => {
                const paypal = new Paypal(core, { usePayPalV6: {} });
                paypal.paymentData = 'pd-v6';
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                const data = { orderId: 'order-v6' } as any;
                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6(data);

                expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({ data: { details: { orderID: 'order-v6' }, paymentData: 'pd-v6' } });
            });

            test('should pass undefined paymentData when none is stored', async () => {
                const paypal = new Paypal(core, { usePayPalV6: {} });
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                const data = { orderId: 'order-v6' } as any;
                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6(data);

                expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({ data: { details: { orderID: 'order-v6' }, paymentData: undefined } });
            });

            test('should remap orderId/payerId to orderID/payerID and forward the remaining data', async () => {
                const paypal = new Paypal(core, { usePayPalV6: {} });
                paypal.paymentData = 'pd-v6';
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                const data = { orderId: 'order-v6', payerId: 'payer-v6', paymentSource: 'paypal' } as any;
                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6(data);

                expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                    data: {
                        details: { orderID: 'order-v6', payerID: 'payer-v6', paymentSource: 'paypal' },
                        paymentData: 'pd-v6'
                    }
                });
            });

            test('should forward the data as-is when there is no orderId (save payment flow)', async () => {
                const paypal = new Paypal(core, { usePayPalV6: {} });
                paypal.paymentData = 'pd-v6';
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                const data = { vaultSetupToken: 'vault-token-v6' } as any;
                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6(data);

                expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                    data: { details: { vaultSetupToken: 'vault-token-v6' }, paymentData: 'pd-v6' }
                });
            });
        });

        describe('V6 shipping change handlers', () => {
            test('handleOnShippingAddressChangeV6 should call the merchant callback with the component instance', async () => {
                const onShippingAddressChangeMock = jest.fn().mockResolvedValue(undefined);
                const paypal = new Paypal(core, { usePayPalV6: { onShippingAddressChange: onShippingAddressChangeMock } });

                const data = { shippingAddress: { city: 'Amsterdam' } } as any;
                // @ts-ignore accessing private method
                await paypal.handleOnShippingAddressChangeV6(data);

                expect(onShippingAddressChangeMock).toHaveBeenCalledWith(data, paypal);
            });

            test('handleOnShippingAddressChangeV6 should resolve when no callback is provided', async () => {
                const paypal = new Paypal(core, { usePayPalV6: {} });
                // @ts-ignore accessing private method
                await expect(paypal.handleOnShippingAddressChangeV6({} as any)).resolves.toBeUndefined();
            });

            test('handleOnShippingOptionsChangeV6 should call the merchant callback with the component instance', async () => {
                const onShippingOptionsChangeMock = jest.fn().mockResolvedValue(undefined);
                const paypal = new Paypal(core, { usePayPalV6: { onShippingOptionsChange: onShippingOptionsChangeMock } });

                const data = { selectedShippingOption: { id: 'option-1' } } as any;
                // @ts-ignore accessing private method
                await paypal.handleOnShippingOptionsChangeV6(data);

                expect(onShippingOptionsChangeMock).toHaveBeenCalledWith(data, paypal);
            });

            test('handleOnShippingOptionsChangeV6 should resolve when no callback is provided', async () => {
                const paypal = new Paypal(core, { usePayPalV6: {} });
                // @ts-ignore accessing private method
                await expect(paypal.handleOnShippingOptionsChangeV6({} as any)).resolves.toBeUndefined();
            });
        });

        describe('componentToRender', () => {
            test('should render the PayPalComponentV6 forwarding the usePayPalV6 configuration', () => {
                const style = { paypal: { type: 'pay' as const, class: 'paypal-gold' as const } };
                const presentationModeOptions = { presentationMode: 'modal' as const };
                const paypal = new Paypal(core, {
                    showPayButton: true,
                    usePayPalV6: {
                        commit: true,
                        vault: true,
                        style,
                        presentationModeOptions,
                        blockPayPalCreditButton: true,
                        blockPayPalPayLaterButton: false,
                        blockPayPalVenmoButton: true,
                        onShippingAddressChange: jest.fn(),
                        onShippingOptionsChange: jest.fn()
                    }
                });

                render(paypal.render());

                expect(mockPayPalComponentV6).toHaveBeenCalledWith(
                    expect.objectContaining({
                        commit: true,
                        vault: true,
                        style,
                        presentationModeOptions,
                        blockPayPalCreditButton: true,
                        blockPayPalPayLaterButton: false,
                        blockPayPalVenmoButton: true,
                        onSubmit: expect.any(Function),
                        onApprove: expect.any(Function),
                        onShippingAddressChange: expect.any(Function),
                        onShippingOptionsChange: expect.any(Function),
                        onCancel: expect.any(Function),
                        onError: expect.any(Function),
                        setComponentRef: expect.any(Function)
                    })
                );
            });

            test('should map the onCancel prop to a CANCEL AdyenCheckoutError', () => {
                const onErrorMock = jest.fn();
                const paypal = new Paypal(core, { showPayButton: true, usePayPalV6: {}, onError: onErrorMock });
                render(paypal.render());

                const { onCancel } = mockPayPalComponentV6.mock.calls[0][0];
                onCancel();

                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
            });

            test('should map the onError prop to an ERROR AdyenCheckoutError preserving the cause', () => {
                const onErrorMock = jest.fn();
                const paypal = new Paypal(core, { showPayButton: true, usePayPalV6: {}, onError: onErrorMock });
                render(paypal.render());

                const cause = new Error('sdk failure');
                const { onError } = mockPayPalComponentV6.mock.calls[0][0];
                onError(cause);

                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
                expect(onErrorMock.mock.calls[0][0]).toMatchObject({ cause });
            });
        });
    });
});
