import { h } from 'preact';
import { mock } from 'jest-mock-extended';
import { BasePaypalElement } from './BasePaypalElement';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../../config/testMocks/setup-core-mock';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import CancelError from '../../../core/Errors/CancelError';
import { InfoEventType } from '../../../core/Analytics/events/AnalyticsInfoEvent';
import { PayPalService } from '../services/PayPalService';
import { PayPalSdkLoader } from '../services/PayPalSdkLoader';
import requestPayPalOrderDetails from '../services/request-paypal-order-details';
import type { IAnalytics } from '../../../core/Analytics/Analytics';
import type { PaymentAction } from '../../../types/global-types';
import type { PayPalComponents, PayPalEligiblePaymentMethods, PayPalV6OnApproveData } from '../paypal-js-types';
import type { BasePayPalConfiguration, SupportedPayPalFundingSources } from '../types';

jest.mock('../services/PayPalService');
jest.mock('../services/PayPalSdkLoader');
jest.mock('../services/request-paypal-order-details');

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;
const PayPalSdkLoaderMock = PayPalSdkLoader as jest.MockedClass<typeof PayPalSdkLoader>;
const requestPayPalOrderDetailsMock = requestPayPalOrderDetails as jest.Mock;

/**
 * BasePaypalElement is never instantiated directly - 'componentToRender' throws by design. This subclass
 * provides the minimum a concrete variant (PayPal, Venmo, ...) supplies, so the shared logic can be tested.
 */
class TestPaypalElement extends BasePaypalElement {
    protected override elementName = 'TestPayPal';

    protected override componentToRender(): h.JSX.Element | null {
        return null;
    }
}

const core = setupCoreMock();
const isEligibleMock = jest.fn();

const createElement = (props?: BasePayPalConfiguration) => new TestPaypalElement(core, props);

describe('BasePaypalElement', () => {
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
        test('should always create the SDK loader and the PayPal service', () => {
            createElement({
                nonce: 'test-nonce',
                configuration: { merchantId: 'merchant-1' },
                countryCode: 'US',
                amount: { value: 1000, currency: 'USD' },
                vault: true
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

        test('should default vault to false and the country code to an empty string', () => {
            createElement();

            expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ vault: false, countryCode: '' }));
        });

        test('should only request the paypal-payments component by default', () => {
            createElement();

            expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments'] }));
        });

        test('should let a subclass extend the requested SDK components', () => {
            class MultiComponentElement extends TestPaypalElement {
                protected override get paypalComponents(): PayPalComponents {
                    return ['paypal-payments', 'venmo-payments'];
                }
            }

            new MultiComponentElement(core);

            expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments', 'venmo-payments'] }));
        });

        test('should report the error via onError when initialization fails', async () => {
            const initError = new Error('Failed to load token');
            PayPalServiceMock.prototype.initialize.mockRejectedValue(initError);
            const onErrorMock = jest.fn();

            createElement({ onError: onErrorMock });

            await new Promise(process.nextTick);

            expect(onErrorMock).toHaveBeenCalledTimes(1);
            expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
            expect(onErrorMock.mock.calls[0][0]).toMatchObject({
                message: 'Something went wrong while initializing TestPayPal',
                cause: initError
            });
        });

        test('should forward an AdyenCheckoutError as-is when initialization fails', async () => {
            const initError = new AdyenCheckoutError('NETWORK_ERROR', 'PayPal token request failed');
            PayPalServiceMock.prototype.initialize.mockRejectedValue(initError);
            const onErrorMock = jest.fn();

            createElement({ onError: onErrorMock });

            await new Promise(process.nextTick);

            expect(onErrorMock).toHaveBeenCalledWith(initError, expect.anything());
        });
    });

    describe('isAvailable', () => {
        test('should wait for the SDK and resolve when the funding source is eligible', async () => {
            const element = createElement();

            await expect(element.isAvailable()).resolves.toBeUndefined();

            expect(PayPalServiceMock.prototype.isSdkLoaded).toHaveBeenCalledTimes(1);
            expect(isEligibleMock).toHaveBeenCalledWith('paypal');
        });

        test('should check the eligibility of the funding source declared by the subclass', async () => {
            class VenmoLikeElement extends TestPaypalElement {
                protected override fundingSource: SupportedPayPalFundingSources = 'venmo';
            }

            await new VenmoLikeElement(core).isAvailable();

            expect(isEligibleMock).toHaveBeenCalledWith('venmo');
        });

        test('should reject when the funding source is not eligible', async () => {
            isEligibleMock.mockReturnValue(false);
            const element = createElement();

            await expect(element.isAvailable()).rejects.toBeInstanceOf(AdyenCheckoutError);
            await expect(element.isAvailable()).rejects.toThrow('TestPayPal is not available');
        });

        test('should reject when the SDK fails to load', async () => {
            PayPalServiceMock.prototype.isSdkLoaded.mockRejectedValue(new Error('PayPal SDK not loaded'));
            const element = createElement();

            await expect(element.isAvailable()).rejects.toThrow('PayPal SDK not loaded');
            expect(isEligibleMock).not.toHaveBeenCalled();
        });

        test('should reject when the PayPal service was never created', async () => {
            const element = createElement();
            // @ts-ignore overriding a protected property to simulate a missing service
            element.paypalService = undefined;

            await expect(element.isAvailable()).rejects.toThrow('TestPayPal is not available');
            expect(PayPalServiceMock.prototype.isSdkLoaded).not.toHaveBeenCalled();
        });
    });

    describe('data', () => {
        test('should return a data object with the sdk subtype', () => {
            const element = createElement();

            expect(element.data).toEqual({
                clientStateDataIndicator: true,
                paymentMethod: {
                    type: 'paypal',
                    subtype: 'sdk',
                    checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                    sdkData: expect.any(String)
                },
                riskData: { clientData: TEST_RISK_DATA }
            });
        });

        test('should return the express subtype when the isExpress flag is set', () => {
            const element = createElement({ isExpress: true });

            expect(element.data.paymentMethod).toEqual(expect.objectContaining({ type: 'paypal', subtype: 'express' }));
        });

        test('should report the paypal type regardless of the subclass tx variant', () => {
            class CreditLikeElement extends TestPaypalElement {
                public static override readonly type = 'paypal_credit';
            }

            expect(new CreditLikeElement(core).data.paymentMethod).toEqual(expect.objectContaining({ type: 'paypal' }));
        });
    });

    test('should always be valid', () => {
        expect(createElement().isValid).toBe(true);
    });

    test('should prevent calling submit manually', () => {
        const onErrorMock = jest.fn();
        const element = createElement({ onError: onErrorMock });

        element.submit();

        expect(onErrorMock).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Calling submit() is not supported for this payment method' }),
            expect.anything()
        );
    });

    describe('beforeRender', () => {
        test('should send a rendered analytics event with the merchant configuration', () => {
            const analytics = mock<IAnalytics>({ checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID });
            const element = new TestPaypalElement(setupCoreMock({ analyticsMock: analytics }), { isExpress: true, expressPage: 'cart' });

            // @ts-ignore accessing a protected method
            element.beforeRender({ isExpress: true, expressPage: 'cart' });

            expect(analytics.sendAnalytics).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: InfoEventType.rendered,
                    isExpress: true,
                    expressPage: 'cart'
                })
            );
        });
    });

    describe('updatePaymentData', () => {
        test('should store the new payment data', () => {
            const element = createElement();

            element.updatePaymentData('new-payment-data');

            expect(element.paymentData).toBe('new-payment-data');
        });

        test('should warn when the payment data is empty', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const element = createElement();

            element.updatePaymentData('');

            expect(consoleWarnSpy).toHaveBeenCalledWith('TestPayPal - Updating payment data with an invalid value');
            consoleWarnSpy.mockRestore();
        });
    });

    describe('updateWithAction', () => {
        const createAction = (action: Partial<PaymentAction> = {}): PaymentAction => ({
            type: 'sdk',
            paymentMethodType: 'paypal',
            paymentData: 'payment-data',
            sdkData: { token: 'sdk-token' },
            ...action
        });

        test('should throw when the action is not for PayPal', () => {
            const element = createElement();

            expect(() => element.updateWithAction(createAction({ paymentMethodType: 'scheme' }))).toThrow('Invalid Action');
        });

        test('should accept a paypal action even when the subclass declares another tx variant', () => {
            class VenmoLikeElement extends TestPaypalElement {
                public static override readonly type = 'paypal_venmo';
            }
            const element = new VenmoLikeElement(core);

            expect(() => element.updateWithAction(createAction())).not.toThrow();
        });

        test('should store the payment data and resolve the pending submit with the sdk token', async () => {
            const element = createElement();
            // @ts-ignore accessing a protected method
            const submitPromise = element.handleSubmit();

            element.updateWithAction(createAction());

            expect(element.paymentData).toBe('payment-data');
            await expect(submitPromise).resolves.toBe('sdk-token');
        });

        test('should notify that the action was handled', () => {
            const onActionHandledMock = jest.fn();
            const element = createElement({ onActionHandled: onActionHandledMock });
            // @ts-ignore accessing a protected method
            void element.handleSubmit();

            const action = createAction();
            element.updateWithAction(action);

            expect(onActionHandledMock).toHaveBeenCalledWith({
                componentType: 'paypal',
                actionDescription: 'sdk-loaded',
                originalAction: action
            });
        });

        test('should reject the pending submit when the action carries no token', async () => {
            const element = createElement();
            // @ts-ignore accessing a protected method
            const submitPromise = element.handleSubmit();

            element.updateWithAction(createAction({ sdkData: undefined }));

            await expect(submitPromise).rejects.toThrow('No token was provided');
        });

        test('should report an error when there is no pending payment to resolve', () => {
            const onErrorMock = jest.fn();
            const element = createElement({ onError: onErrorMock });

            element.updateWithAction(createAction());

            expect(onErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'The instance of the PayPal component being used is not the same which started the payment'
                }),
                expect.anything()
            );
        });

        test('should report an error when there is no pending payment to reject', () => {
            const onErrorMock = jest.fn();
            const element = createElement({ onError: onErrorMock });

            element.updateWithAction(createAction({ sdkData: undefined }));

            expect(onErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'The instance of the PayPal component being used is not the same which started the payment'
                }),
                expect.anything()
            );
        });

        test('handleAction should delegate to updateWithAction', () => {
            const element = createElement();
            const updateWithActionSpy = jest.spyOn(element, 'updateWithAction');
            const action = createAction();

            element.handleAction(action);

            expect(updateWithActionSpy).toHaveBeenCalledWith(action);
        });
    });

    describe('handleOnApprove', () => {
        const approve = async (element: BasePaypalElement, data: unknown) => {
            // @ts-ignore accessing a protected method
            await element.handleOnApprove(data as PayPalV6OnApproveData);
        };

        test('should remap orderId/payerId to the casing expected by /payments/details', async () => {
            const element = createElement();
            element.paymentData = 'payment-data';
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

            await approve(element, { orderId: 'order-1', payerId: 'payer-1', paymentSource: 'paypal' });

            expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                data: {
                    details: { orderID: 'order-1', payerID: 'payer-1', paymentSource: 'paypal' },
                    paymentData: 'payment-data'
                }
            });
        });

        test('should remap vaultSetupToken to vaultToken in the save payment (zero-auth) flow', async () => {
            const element = createElement();
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

            await approve(element, { vaultSetupToken: 'vault-token-1', payerId: 'payer-1' });

            expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                data: {
                    details: { vaultToken: 'vault-token-1', payerID: 'payer-1' },
                    paymentData: undefined
                }
            });
        });

        test('should not request the order details when onAuthorized is not provided', async () => {
            const element = createElement();
            // @ts-ignore spying on a protected method
            jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

            await approve(element, { orderId: 'order-1' });

            expect(requestPayPalOrderDetailsMock).not.toHaveBeenCalled();
        });

        test('should not request the order details in the save payment flow, even when onAuthorized is provided', async () => {
            const onAuthorizedMock = jest.fn();
            const element = createElement({ onAuthorized: onAuthorizedMock });
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

            await approve(element, { vaultSetupToken: 'vault-token-1' });

            expect(requestPayPalOrderDetailsMock).not.toHaveBeenCalled();
            expect(onAuthorizedMock).not.toHaveBeenCalled();
            expect(handleAdditionalDetailsSpy).toHaveBeenCalledTimes(1);
        });

        describe('when onAuthorized is provided', () => {
            const orderDetails = {
                payPalOrder: { id: 'order-1' },
                billingAddress: { street: 'Simon Carmiggeltstraat', city: 'Amsterdam', country: 'NL' },
                deliveryAddress: { street: 'Simon Carmiggeltstraat', city: 'Amsterdam', country: 'NL' },
                shopperName: { firstName: 'John', lastName: 'Doe' }
            };

            test('should fetch the order details and hand them over to the merchant', async () => {
                requestPayPalOrderDetailsMock.mockResolvedValue(orderDetails);
                const onAuthorizedMock = jest.fn((_data, actions) => actions.resolve());
                const element = createElement({
                    onAuthorized: onAuthorizedMock,
                    clientKey: 'test_client_key',
                    loadingContext: 'https://loading-context.test/',
                    configuration: { merchantId: 'merchant-1' }
                });
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

                await approve(element, { orderId: 'order-1' });

                expect(requestPayPalOrderDetailsMock).toHaveBeenCalledWith('https://loading-context.test/', {
                    clientKey: 'test_client_key',
                    merchantId: 'merchant-1',
                    orderId: 'order-1'
                });
                expect(onAuthorizedMock).toHaveBeenCalledWith(
                    {
                        authorizedEvent: orderDetails.payPalOrder,
                        billingAddress: orderDetails.billingAddress,
                        deliveryAddress: orderDetails.deliveryAddress,
                        shopperName: orderDetails.shopperName
                    },
                    { resolve: expect.any(Function), reject: expect.any(Function) }
                );
                expect(handleAdditionalDetailsSpy).toHaveBeenCalledTimes(1);
            });

            test('should omit the address and shopper details that were not returned', async () => {
                requestPayPalOrderDetailsMock.mockResolvedValue({ payPalOrder: { id: 'order-1' } });
                const onAuthorizedMock = jest.fn((_data, actions) => actions.resolve());
                const element = createElement({ onAuthorized: onAuthorizedMock });
                // @ts-ignore spying on a protected method
                jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

                await approve(element, { orderId: 'order-1' });

                expect(onAuthorizedMock).toHaveBeenCalledWith({ authorizedEvent: { id: 'order-1' } }, expect.anything());
            });

            test('should report the error and skip the details call when fetching the order fails', async () => {
                const requestError = new Error('Order not found');
                requestPayPalOrderDetailsMock.mockRejectedValue(requestError);
                const onErrorMock = jest.fn();
                const element = createElement({ onAuthorized: jest.fn(), onError: onErrorMock });
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

                await approve(element, { orderId: 'order-1' });

                expect(handleAdditionalDetailsSpy).not.toHaveBeenCalled();
                expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
                expect(onErrorMock.mock.calls[0][0]).toMatchObject({
                    message: 'Something went wrong while fetching TestPayPal Order',
                    cause: requestError
                });
            });

            test('should report the error when the merchant rejects the authorization', async () => {
                requestPayPalOrderDetailsMock.mockResolvedValue(orderDetails);
                const onErrorMock = jest.fn();
                const element = createElement({
                    onAuthorized: (_data, actions) => actions.reject(),
                    onError: onErrorMock
                });
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(element, 'handleAdditionalDetails').mockImplementation(() => element);

                await approve(element, { orderId: 'order-1' });

                expect(handleAdditionalDetailsSpy).not.toHaveBeenCalled();
                expect(onErrorMock.mock.calls[0][0]).toMatchObject({ message: 'Something went wrong while fetching TestPayPal Order' });
            });
        });
    });

    describe('handleSubmit', () => {
        test('should reject with the payment failure reason and notify onPaymentFailed', async () => {
            const onPaymentFailedMock = jest.fn();
            const element = createElement({
                onSubmit: (_data, _component, actions) => actions.resolve({ resultCode: 'Refused' }),
                onPaymentFailed: onPaymentFailedMock
            });

            // @ts-ignore accessing a protected method
            const submitPromise = element.handleSubmit();

            await new Promise(process.nextTick);

            expect(onPaymentFailedMock).toHaveBeenCalledWith({ resultCode: 'Refused' }, element);
            await expect(submitPromise).rejects.toThrow('Something went wrong during PayPal payment: {"resultCode":"Refused"}');
        });

        test('should include the error message when the payments call rejects with an Error', async () => {
            const element = createElement({
                onSubmit: jest.fn().mockImplementation((_data, _component, actions) => actions.reject(new Error('Network timeout')))
            });

            // @ts-ignore accessing a protected method
            const submitPromise = element.handleSubmit();

            await expect(submitPromise).rejects.toThrow('Something went wrong during PayPal payment: Network timeout');
        });

        test('should reset the status and leave the promise pending when the shopper cancels', async () => {
            const onPaymentFailedMock = jest.fn();
            const element = createElement({
                onSubmit: jest.fn().mockImplementation((_data, _component, actions) => actions.reject(new CancelError('cancelled'))),
                onPaymentFailed: onPaymentFailedMock
            });
            const setElementStatusSpy = jest.spyOn(element, 'setElementStatus');

            // @ts-ignore accessing a protected method
            const submitPromise = element.handleSubmit();

            await new Promise(process.nextTick);

            expect(setElementStatusSpy).toHaveBeenCalledWith('ready');
            expect(onPaymentFailedMock).not.toHaveBeenCalled();

            const raceResult = await Promise.race([
                submitPromise.then(
                    () => 'settled',
                    () => 'settled'
                ),
                Promise.resolve('pending')
            ]);
            expect(raceResult).toBe('pending');
        });
    });

    describe('shipping change handlers', () => {
        test('should forward the shipping address change to the merchant along with the component', async () => {
            const onShippingAddressChangeMock = jest.fn().mockResolvedValue(undefined);
            const element = createElement({ onShippingAddressChange: onShippingAddressChangeMock });
            const data = { orderId: 'order-1', shippingAddress: { city: 'Amsterdam', countryCode: 'NL' } };

            // @ts-ignore accessing a protected method
            await element.handleOnShippingAddressChange(data);

            expect(onShippingAddressChangeMock).toHaveBeenCalledWith(data, element);
        });

        test('should resolve without calling anything when no shipping address callback is set', async () => {
            const element = createElement();

            // @ts-ignore accessing a protected method
            await expect(element.handleOnShippingAddressChange({})).resolves.toBeUndefined();
        });

        test('should forward the shipping options change to the merchant along with the component', async () => {
            const onShippingOptionsChangeMock = jest.fn().mockResolvedValue(undefined);
            const element = createElement({ onShippingOptionsChange: onShippingOptionsChangeMock });
            const data = { orderId: 'order-1', selectedShippingOption: { id: 'express' } };

            // @ts-ignore accessing a protected method
            await element.handleOnShippingOptionsChange(data);

            expect(onShippingOptionsChangeMock).toHaveBeenCalledWith(data, element);
        });

        test('should resolve without calling anything when no shipping options callback is set', async () => {
            const element = createElement();

            // @ts-ignore accessing a protected method
            await expect(element.handleOnShippingOptionsChange({})).resolves.toBeUndefined();
        });
    });

    test('should throw when the subclass does not implement componentToRender', () => {
        class IncompleteElement extends BasePaypalElement {}

        // @ts-ignore accessing a protected method
        expect(() => new IncompleteElement(core).componentToRender()).toThrow('Method not implemented.');
    });
});
