import Paypal from './Paypal';
import { render } from '@testing-library/preact';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { PayPalService } from './services/PayPalService';
import { PayPalSdkLoader } from './services/PayPalSdkLoader';
import requestPayPalOrderDetails from './services/request-paypal-order-details';
import base64 from '../../utils/base64';
import type { PayPalEligiblePaymentMethods, PayPalSdkInstance } from './paypal-js-types';
import type { PayPalComponentV6Props } from './components/types';
import type { PayPalPresentationModeOptions } from './types';

jest.mock('./services/PayPalService');
jest.mock('./services/PayPalSdkLoader');
jest.mock('./services/request-paypal-order-details');

const mockPayPalComponentV6 = jest.fn();
jest.mock('./components/PaypalComponentV6', () => ({
    PayPalComponentV6: (props: PayPalComponentV6Props) => {
        mockPayPalComponentV6(props);
        return null;
    }
}));

const PayPalServiceMock = PayPalService as jest.MockedClass<typeof PayPalService>;
const PayPalSdkLoaderMock = PayPalSdkLoader as jest.MockedClass<typeof PayPalSdkLoader>;
const requestPayPalOrderDetailsMock = requestPayPalOrderDetails as jest.Mock;

const core = setupCoreMock();

const decodeSdkData = (input: string) => {
    const { data } = base64.decode(input);
    if (!data) {
        throw new Error('Failed to decode sdkData');
    }
    return JSON.parse(data);
};

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

        test('should flag in the sdkData that PayPal v6 is supported', () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });

            const decodedSdkData = decodeSdkData(paypal.data.paymentMethod.sdkData);

            expect(decodedSdkData.paymentMethodConfiguration).toEqual({ supportsPayPalV6: true });
        });

        test('should default vault to false when not provided in usePayPalV6', () => {
            new Paypal(core, { usePayPalV6: {} });

            expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ vault: false }));
        });

        test('should pass the paypal and venmo components to the PayPal service by default', () => {
            new Paypal(core, { usePayPalV6: {} });

            expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments', 'venmo-payments'] }));
        });

        test('should not pass the venmo component to the PayPal service when the venmo button is blocked', () => {
            new Paypal(core, { usePayPalV6: { blockPayPalVenmoButton: true } });

            expect(PayPalServiceMock).toHaveBeenCalledWith(expect.objectContaining({ components: ['paypal-payments'] }));
        });

        test('should pass the messages component to the PayPal service when onCreatePayPalMessages is provided', () => {
            new Paypal(core, { usePayPalV6: { onCreatePayPalMessages: jest.fn() } });

            expect(PayPalServiceMock).toHaveBeenCalledWith(
                expect.objectContaining({ components: ['paypal-payments', 'venmo-payments', 'paypal-messages'] })
            );
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

        test.each([
            ['onShippingAddressChange', { onShippingAddressChange: jest.fn() }],
            ['onShippingOptionsChange', { onShippingOptionsChange: jest.fn() }],
            ['both shipping callbacks', { onShippingAddressChange: jest.fn(), onShippingOptionsChange: jest.fn() }]
        ])('should throw an implementation error when %s is provided and isExpress is not set', (_name, shippingCallbacks) => {
            expect(() => new Paypal(core, { usePayPalV6: { ...shippingCallbacks } })).toThrow(
                'PayPal - You must set "isExpress" flag to "true" in order to use "onShippingAddressChange" and/or "onShippingOptionsChange" callbacks'
            );
            expect(PayPalServiceMock.prototype.initialize).not.toHaveBeenCalled();
        });

        test('should throw an AdyenCheckoutError of type IMPLEMENTATION_ERROR when the shipping callbacks are used without isExpress', () => {
            let caughtError: unknown;

            try {
                new Paypal(core, { usePayPalV6: { onShippingAddressChange: jest.fn() } });
            } catch (error) {
                caughtError = error;
            }

            expect(caughtError).toBeInstanceOf(AdyenCheckoutError);
            expect((caughtError as AdyenCheckoutError).name).toBe('IMPLEMENTATION_ERROR');
        });

        test('should not throw when the shipping callbacks are used and isExpress is true', () => {
            expect(
                () =>
                    new Paypal(core, {
                        isExpress: true,
                        usePayPalV6: { onShippingAddressChange: jest.fn(), onShippingOptionsChange: jest.fn() }
                    })
            ).not.toThrow();

            expect(PayPalServiceMock.prototype.initialize).toHaveBeenCalledTimes(1);
        });

        test('should not throw when no shipping callbacks are provided and isExpress is not set', () => {
            expect(() => new Paypal(core, { usePayPalV6: {} })).not.toThrow();
        });

        test('should not throw when the v5 shipping callbacks are used without isExpress', () => {
            expect(() => new Paypal(core, { onShippingAddressChange: jest.fn(), onShippingOptionsChange: jest.fn() })).not.toThrow();
        });

        test.each([['redirect'], ['direct-app-switch']])(
            'should throw an implementation error when isExpress is true and the presentation mode is "%s"',
            presentationMode => {
                expect(
                    () =>
                        new Paypal(core, {
                            isExpress: true,
                            usePayPalV6: { presentationModeOptions: { presentationMode } as PayPalPresentationModeOptions }
                        })
                ).toThrow(`PayPal - Unsupported presentation mode: ${presentationMode} for express checkout`);

                expect(PayPalServiceMock.prototype.initialize).not.toHaveBeenCalled();
            }
        );

        test('should throw an AdyenCheckoutError of type IMPLEMENTATION_ERROR when an unsupported express presentation mode is used', () => {
            let caughtError: unknown;

            try {
                new Paypal(core, { isExpress: true, usePayPalV6: { presentationModeOptions: { presentationMode: 'redirect' } } });
            } catch (error) {
                caughtError = error;
            }

            expect(caughtError).toBeInstanceOf(AdyenCheckoutError);
            expect((caughtError as AdyenCheckoutError).name).toBe('IMPLEMENTATION_ERROR');
        });

        test.each([['popup'], ['modal'], ['payment-handler'], ['auto']])(
            'should not throw when isExpress is true and the presentation mode is "%s"',
            presentationMode => {
                expect(
                    () =>
                        new Paypal(core, {
                            isExpress: true,
                            usePayPalV6: { presentationModeOptions: { presentationMode } as PayPalPresentationModeOptions }
                        })
                ).not.toThrow();

                expect(PayPalServiceMock.prototype.initialize).toHaveBeenCalledTimes(1);
            }
        );

        test('should not throw when an unsupported express presentation mode is used but isExpress is not set', () => {
            expect(() => new Paypal(core, { usePayPalV6: { presentationModeOptions: { presentationMode: 'redirect' } } })).not.toThrow();

            expect(PayPalServiceMock.prototype.initialize).toHaveBeenCalledTimes(1);
        });

        test('should not throw when isExpress is true and no presentation mode is provided', () => {
            expect(() => new Paypal(core, { isExpress: true, usePayPalV6: {} })).not.toThrow();
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

    describe('onCreatePayPalMessages', () => {
        const createPayPalMessagesMock = jest.fn();

        const mockSdkInstance = (instance?: Partial<PayPalSdkInstance>) => {
            PayPalServiceMock.prototype.getInstance.mockReturnValue(instance as PayPalSdkInstance);
        };

        test('should hand over the SDK createPayPalMessages function once the service is initialized', async () => {
            mockSdkInstance({ createPayPalMessages: createPayPalMessagesMock });
            const onCreatePayPalMessagesMock = jest.fn();

            new Paypal(core, { usePayPalV6: { onCreatePayPalMessages: onCreatePayPalMessagesMock } });

            expect(onCreatePayPalMessagesMock).not.toHaveBeenCalled();

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(onCreatePayPalMessagesMock).toHaveBeenCalledTimes(1);
            expect(onCreatePayPalMessagesMock).toHaveBeenCalledWith(createPayPalMessagesMock);
        });

        test('should not be called when the SDK instance does not expose createPayPalMessages', async () => {
            mockSdkInstance({});
            const onCreatePayPalMessagesMock = jest.fn();

            new Paypal(core, { usePayPalV6: { onCreatePayPalMessages: onCreatePayPalMessagesMock } });

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(onCreatePayPalMessagesMock).not.toHaveBeenCalled();
        });

        test('should not be called when there is no SDK instance', async () => {
            mockSdkInstance(undefined);
            const onCreatePayPalMessagesMock = jest.fn();

            new Paypal(core, { usePayPalV6: { onCreatePayPalMessages: onCreatePayPalMessagesMock } });

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(onCreatePayPalMessagesMock).not.toHaveBeenCalled();
        });

        test('should not read the SDK instance when the callback is not provided', async () => {
            mockSdkInstance({ createPayPalMessages: createPayPalMessagesMock });

            new Paypal(core, { usePayPalV6: {} });

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(PayPalServiceMock.prototype.getInstance).not.toHaveBeenCalled();
            expect(createPayPalMessagesMock).not.toHaveBeenCalled();
        });

        test('should not be called when the service fails to initialize', async () => {
            mockSdkInstance({ createPayPalMessages: createPayPalMessagesMock });
            PayPalServiceMock.prototype.initialize.mockRejectedValue(new Error('Failed to load token'));
            const onCreatePayPalMessagesMock = jest.fn();
            const onErrorMock = jest.fn();

            new Paypal(core, { usePayPalV6: { onCreatePayPalMessages: onCreatePayPalMessagesMock }, onError: onErrorMock });

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(onCreatePayPalMessagesMock).not.toHaveBeenCalled();
            expect(onErrorMock).toHaveBeenCalledTimes(1);
        });

        test('should report the error via onError when the merchant callback throws', async () => {
            mockSdkInstance({ createPayPalMessages: createPayPalMessagesMock });
            const callbackError = new Error('Failed to render the messages component');
            const onErrorMock = jest.fn();

            new Paypal(core, {
                usePayPalV6: {
                    onCreatePayPalMessages: () => {
                        throw callbackError;
                    }
                },
                onError: onErrorMock
            });

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(onErrorMock).toHaveBeenCalledTimes(1);
            expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
            expect(onErrorMock.mock.calls[0][0]).toMatchObject({
                message: 'Something went wrong while initializing PayPal',
                cause: callbackError
            });
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

        test('should remap orderId/payerId/fundingSource to orderID/payerID/paymentSource and drop the remaining data', async () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });
            paypal.paymentData = 'pd-v6';
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            const data = { orderId: 'order-v6', payerId: 'payer-v6', fundingSource: 'paypal', billingToken: 'should-be-dropped' } as any;
            // @ts-ignore accessing private method
            await paypal.handleOnApproveV6(data);

            expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                data: {
                    details: { orderID: 'order-v6', payerID: 'payer-v6', paymentSource: 'paypal' },
                    paymentData: 'pd-v6'
                }
            });
            // @ts-ignore inspecting the call arguments
            expect(handleAdditionalDetailsSpy.mock.calls[0][0].data.details).not.toHaveProperty('billingToken');
        });

        test('should set paymentSource to undefined when the approve data has no fundingSource (one-time payment flow)', async () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            // @ts-ignore accessing private method
            await paypal.handleOnApproveV6({ orderId: 'order-v6', payerId: 'payer-v6' });

            // @ts-ignore inspecting the call arguments
            expect(handleAdditionalDetailsSpy.mock.calls[0][0].data.details.paymentSource).toBeUndefined();
        });

        test('should remap vaultSetupToken/payerId to vaultToken/payerID when there is no orderId (save payment flow)', async () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });
            paypal.paymentData = 'pd-v6';
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            const data = { vaultSetupToken: 'vault-token-v6', payerId: 'payer-v6' } as any;
            // @ts-ignore accessing private method
            await paypal.handleOnApproveV6(data);

            expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                data: { details: { vaultToken: 'vault-token-v6', payerID: 'payer-v6' }, paymentData: 'pd-v6' }
            });
        });

        test('should remap fundingSource to paymentSource in the save payment flow', async () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });
            paypal.paymentData = 'pd-v6';
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            const data = { vaultSetupToken: 'vault-token-v6', payerId: 'payer-v6', fundingSource: 'venmo' } as any;
            // @ts-ignore accessing private method
            await paypal.handleOnApproveV6(data);

            expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                data: {
                    details: { vaultToken: 'vault-token-v6', payerID: 'payer-v6', paymentSource: 'venmo' },
                    paymentData: 'pd-v6'
                }
            });
        });

        test('should report the error and skip handleAdditionalDetails when the approve data has no orderId nor vaultSetupToken', async () => {
            const onErrorMock = jest.fn();
            const onAuthorizedMock = jest.fn();
            const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock }, onError: onErrorMock });
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            // @ts-ignore accessing private method
            await expect(paypal.handleOnApproveV6({ payerId: 'payer-v6' } as any)).resolves.toBeUndefined();

            expect(handleAdditionalDetailsSpy).not.toHaveBeenCalled();
            expect(requestPayPalOrderDetailsMock).not.toHaveBeenCalled();
            expect(onAuthorizedMock).not.toHaveBeenCalled();
            expect(onErrorMock).toHaveBeenCalledTimes(1);
            expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
            expect(onErrorMock.mock.calls[0][0]).toMatchObject({
                message: 'Missing `orderId` or `vaultSetupToken` in PayPal approval data'
            });
        });

        test('should not request the order details when onAuthorized is not provided', async () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });
            // @ts-ignore spying on a protected method
            jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            // @ts-ignore accessing private method
            await paypal.handleOnApproveV6({ orderId: 'order-v6' });

            expect(requestPayPalOrderDetailsMock).not.toHaveBeenCalled();
        });

        test('should not request the order details when there is no orderId, even if onAuthorized is provided', async () => {
            const onAuthorizedMock = jest.fn();
            const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock } });
            // @ts-ignore spying on a protected method
            const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

            // @ts-ignore accessing private method
            await paypal.handleOnApproveV6({ vaultSetupToken: 'vault-token-v6' });

            expect(requestPayPalOrderDetailsMock).not.toHaveBeenCalled();
            expect(onAuthorizedMock).not.toHaveBeenCalled();
            expect(handleAdditionalDetailsSpy).toHaveBeenCalledTimes(1);
        });

        describe('when onAuthorized is provided', () => {
            const orderDetails = {
                requestId: 'request-id',
                shopperName: { firstName: 'John', lastName: 'Doe' },
                billingAddress: { street: 'Simon Carmiggeltstraat', city: 'Amsterdam', country: 'NL' },
                deliveryAddress: { street: 'Simon Carmiggeltstraat', city: 'Amsterdam', country: 'NL', firstName: 'John' },
                payPalOrder: { id: 'order-v6' }
            };

            beforeEach(() => {
                requestPayPalOrderDetailsMock.mockResolvedValue(orderDetails);
            });

            test('should request the order details using the loadingContext, clientKey, merchantId and orderId', async () => {
                const paypal = new Paypal(core, {
                    usePayPalV6: { onAuthorized: jest.fn().mockImplementation((_data, { resolve }) => resolve()) },
                    loadingContext: 'https://loading-context/',
                    clientKey: 'test_client_key',
                    configuration: { merchantId: 'merchant-1' }
                });
                // @ts-ignore spying on a protected method
                jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6({ orderId: 'order-v6' });

                expect(requestPayPalOrderDetailsMock).toHaveBeenCalledWith('https://loading-context/', {
                    clientKey: 'test_client_key',
                    merchantId: 'merchant-1',
                    orderId: 'order-v6'
                });
            });

            test('should set the state and call onAuthorized with the parsed order details', async () => {
                const onAuthorizedMock = jest.fn().mockImplementation((_data, { resolve }) => resolve());
                const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock } });
                // @ts-ignore spying on a protected method
                jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6({ orderId: 'order-v6' });

                const expectedData = {
                    authorizedEvent: orderDetails.payPalOrder,
                    billingAddress: orderDetails.billingAddress,
                    deliveryAddress: orderDetails.deliveryAddress,
                    shopperName: orderDetails.shopperName
                };

                expect(onAuthorizedMock).toHaveBeenCalledWith(
                    expectedData,
                    expect.objectContaining({ resolve: expect.any(Function), reject: expect.any(Function) })
                );
                expect(paypal.state).toMatchObject(expectedData);
            });

            test('should omit the addresses and the shopper name when they are not returned', async () => {
                requestPayPalOrderDetailsMock.mockResolvedValue({ requestId: 'request-id', payPalOrder: { id: 'order-v6' } });
                const onAuthorizedMock = jest.fn().mockImplementation((_data, { resolve }) => resolve());
                const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock } });
                // @ts-ignore spying on a protected method
                jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6({ orderId: 'order-v6' });

                expect(onAuthorizedMock).toHaveBeenCalledWith({ authorizedEvent: { id: 'order-v6' } }, expect.anything());
            });

            test('should call handleAdditionalDetails once onAuthorized resolves', async () => {
                const onAuthorizedMock = jest.fn().mockImplementation((_data, { resolve }) => resolve());
                const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock } });
                paypal.paymentData = 'pd-v6';
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6({ orderId: 'order-v6', payerId: 'payer-v6' });

                expect(handleAdditionalDetailsSpy).toHaveBeenCalledWith({
                    data: { details: { orderID: 'order-v6', payerID: 'payer-v6' }, paymentData: 'pd-v6' }
                });
            });

            test('should report the error and skip handleAdditionalDetails when onAuthorized rejects', async () => {
                const onErrorMock = jest.fn();
                const onAuthorizedMock = jest.fn().mockImplementation((_data, { reject }) => reject());
                const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock }, onError: onErrorMock });
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6({ orderId: 'order-v6' });

                expect(handleAdditionalDetailsSpy).not.toHaveBeenCalled();
                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
                expect(onErrorMock.mock.calls[0][0]).toMatchObject({ message: 'Something went wrong with finalizing the PayPal order' });
            });

            test('should report the error and skip handleAdditionalDetails when the order details request fails', async () => {
                const requestError = new Error('Order details fetch failed');
                requestPayPalOrderDetailsMock.mockRejectedValue(requestError);
                const onErrorMock = jest.fn();
                const onAuthorizedMock = jest.fn();
                const paypal = new Paypal(core, { usePayPalV6: { onAuthorized: onAuthorizedMock }, onError: onErrorMock });
                // @ts-ignore spying on a protected method
                const handleAdditionalDetailsSpy = jest.spyOn(paypal, 'handleAdditionalDetails').mockImplementation(() => paypal);

                // @ts-ignore accessing private method
                await paypal.handleOnApproveV6({ orderId: 'order-v6' });

                expect(onAuthorizedMock).not.toHaveBeenCalled();
                expect(handleAdditionalDetailsSpy).not.toHaveBeenCalled();
                expect(onErrorMock).toHaveBeenCalledTimes(1);
                expect(onErrorMock.mock.calls[0][0]).toBeInstanceOf(AdyenCheckoutError);
                expect(onErrorMock.mock.calls[0][0]).toMatchObject({
                    message: 'Something went wrong with finalizing the PayPal order',
                    cause: requestError
                });
            });
        });
    });

    describe('V6 shipping change handlers', () => {
        test('handleOnShippingAddressChangeV6 should call the merchant callback with the component instance', async () => {
            const onShippingAddressChangeMock = jest.fn().mockResolvedValue(undefined);
            const paypal = new Paypal(core, { isExpress: true, usePayPalV6: { onShippingAddressChange: onShippingAddressChangeMock } });

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
            const paypal = new Paypal(core, { isExpress: true, usePayPalV6: { onShippingOptionsChange: onShippingOptionsChangeMock } });

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

    describe('formatData', () => {
        test('should not add userAction to the payment method data', () => {
            const paypal = new Paypal(core, { usePayPalV6: {}, userAction: 'continue' });

            expect(paypal.data.paymentMethod).not.toHaveProperty('userAction');
            expect(paypal.data.paymentMethod).toMatchObject({ type: 'paypal', subtype: 'sdk' });
        });

        test('should set the subtype to express when isExpress is set', () => {
            const paypal = new Paypal(core, { usePayPalV6: {}, isExpress: true });

            expect(paypal.data.paymentMethod).toMatchObject({ type: 'paypal', subtype: 'express' });
        });

        test('should add storePaymentMethod when vault is set in usePayPalV6', () => {
            const paypal = new Paypal(core, { usePayPalV6: { vault: true } });

            expect(paypal.data.storePaymentMethod).toBe(true);
        });

        test('should add storePaymentMethod when the amount is zero (zero-auth)', () => {
            const paypal = new Paypal(core, { usePayPalV6: {}, amount: { value: 0, currency: 'USD' } });

            expect(paypal.data.storePaymentMethod).toBe(true);
        });

        test('should not add storePaymentMethod when vault is not set and the amount is not zero', () => {
            const paypal = new Paypal(core, { usePayPalV6: {}, amount: { value: 1000, currency: 'USD' } });

            expect(paypal.data).not.toHaveProperty('storePaymentMethod');
        });

        test('should not add storePaymentMethod when PayPal v6 is not used', () => {
            const paypal = new Paypal(core, { amount: { value: 0, currency: 'USD' } });

            expect(paypal.data).not.toHaveProperty('storePaymentMethod');
        });
    });

    describe('componentToRender', () => {
        test('should render the PayPalComponentV6 even when showPayButton is false', () => {
            const paypal = new Paypal(core, { showPayButton: false, usePayPalV6: {} });

            render(paypal.render());

            expect(mockPayPalComponentV6).toHaveBeenCalledTimes(1);
        });

        test('should not render anything when the PayPal service is not available', () => {
            const paypal = new Paypal(core, { usePayPalV6: {} });
            // @ts-ignore overriding private field
            paypal.paypalService = undefined;

            render(paypal.render());

            expect(mockPayPalComponentV6).not.toHaveBeenCalled();
        });

        test('should render the PayPalComponentV6 forwarding the usePayPalV6 configuration', () => {
            const style = { paypal: { type: 'pay' as const, class: 'paypal-gold' as const } };
            const presentationModeOptions = { presentationMode: 'modal' as const };
            const paypal = new Paypal(core, {
                showPayButton: true,
                isExpress: true,
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
