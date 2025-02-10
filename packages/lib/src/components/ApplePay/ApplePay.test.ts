import ApplePay from './ApplePay';
import ApplePayService from './services/ApplePayService';
import ApplePaySdkLoader from './services/ApplePaySdkLoader';
import { mock } from 'jest-mock-extended';
import { NO_CHECKOUT_ATTEMPT_ID } from '../../core/Analytics/constants';

jest.mock('./services/ApplePayService');
jest.mock('./services/ApplePaySdkLoader');

let mockApplePaySession;
// let mockApplePaySdkLoaderLoadFunction;

beforeEach(() => {
    const mockApplePaySdkLoaderLoadFunction = jest.fn().mockImplementation(() => {
        mockApplePaySession = mock<ApplePaySession>({
            // @ts-ignore 'supportsVersion' is not recognized as static member
            canMakePayments: jest.fn().mockReturnValue(true),
            supportsVersion: jest.fn().mockImplementation(() => true),
            STATUS_SUCCESS: 1,
            STATUS_FAILURE: 0
        });

        // @ts-ignore dddd
        global.ApplePaySession = mockApplePaySession;

        Object.defineProperty(window, 'ApplePayWebOptions', {
            writable: true,
            value: {
                set: jest.fn()
            }
        });

        // window.ApplePaySession = {
        //     // @ts-ignore 'supportsVersion' is not recognized as static member
        //     canMakePayments: jest.fn().mockReturnValue(true),
        //     supportsVersion: jest.fn().mockImplementation(() => true),
        //     STATUS_SUCCESS: 1,
        //     STATUS_FAILURE: 0
        // };

        return Promise.resolve(mockApplePaySession);
    });

    // @ts-ignore 'ApplePaySdkLoader' is mocked
    ApplePaySdkLoader.mockImplementation(() => ({
        load: mockApplePaySdkLoaderLoadFunction,
        isSdkLoaded: jest.fn().mockResolvedValue(undefined)
    }));
});

afterEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    ApplePayService.mockClear();
    // @ts-ignore 'mockClear' is provided by jest.mock
    ApplePaySdkLoader.mockClear();

    jest.resetModules();
    jest.resetAllMocks();
});

const configurationMock = {
    merchantName: 'TestMerchant',
    merchantId: 'test-merchant'
};

describe('ApplePay', () => {
    describe('constructor()', () => {
        test('should load the SDK and define the apple pay version/applepay web options', async () => {
            const onApplePayCodeCloseMock = jest.fn();

            new ApplePay(global.core, {
                onApplePayCodeClose: onApplePayCodeCloseMock
            });

            await new Promise(process.nextTick);

            // @ts-ignore 'supportsVersion' is not recognized as static member
            expect(window.ApplePaySession.supportsVersion).toHaveBeenCalledTimes(1);
            // @ts-ignore 'supportsVersion' is not recognized as static member
            expect(window.ApplePaySession.supportsVersion).toHaveBeenCalledWith(14);
            expect(window.ApplePayWebOptions.set).toHaveBeenCalledTimes(1);
            expect(window.ApplePayWebOptions.set).toHaveBeenCalledWith({
                renderApplePayCodeAs: 'modal',
                onApplePayCodeClose: onApplePayCodeCloseMock
            });
        });
    });

    describe('isAvailable()', () => {
        test('should use canMakePayments() API', async () => {
            // document.location.protocol = 'https:';
            const applepay = new ApplePay(global.core);

            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'https:'
                }
            });

            await expect(applepay.isAvailable()).resolves.toBeUndefined();
            expect(ApplePaySession.canMakePayments).toHaveBeenCalledTimes(1);

            console.log(mockApplePaySession);
        });

        test('should reject if the page is not https', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'http:'
                }
            });

            const applepay = new ApplePay(global.core);
            await expect(applepay.isAvailable()).rejects.toThrow('Trying to start an Apple Pay session from an insecure document');
        });

        test('should reject if canMakePayments() returns false', async () => {
            // console.log(mockApplePaySession);
            // window.ApplePaySession = {
            //     // @ts-ignore asdasd
            //     canMakePayments: jest.fn().mockReturnValue(false)
            // };

            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'https:'
                }
            });

            const applepay = new ApplePay(global.core);
            await new Promise(process.nextTick);

            mockApplePaySession.canMakePayments = jest.fn().mockReturnValue(false);

            await expect(applepay.isAvailable()).rejects.toThrow('Apple Pay is not available on this device');
        });

        test('should reject if something fails when loading the SDK', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'https:'
                }
            });

            const applepay = new ApplePay(global.core);
            await new Promise(process.nextTick);

            applepay['sdkLoader'].isSdkLoaded = jest.fn().mockRejectedValue(undefined);

            await expect(applepay.isAvailable()).rejects.toThrow('Apple Pay SDK failed to load');
        });
    });

    describe('isExpress flag', () => {
        test('should add subtype: express when isExpress is configured', () => {
            const applepay = new ApplePay(global.core, { isExpress: true });
            expect(applepay.data.paymentMethod).toHaveProperty('subtype', 'express');
        });
        test('should not add subtype: express when isExpress is omitted', () => {
            const applepay = new ApplePay(global.core);
            expect(applepay.data.paymentMethod).not.toHaveProperty('subtype', 'express');
        });

        test('should throw error when express callbacks are passed but isExpress flag is not set', () => {
            expect(() => new ApplePay(global.core, { onShippingContactSelected: jest.fn() })).toThrow();
        });
    });

    describe('submit()', () => {
        test('should forward apple pay error (if available) to ApplePay if payment fails', async () => {
            const onPaymentFailedMock = jest.fn();
            const error = mock<ApplePayJS.ApplePayError>();
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>({
                payment: {
                    token: {
                        paymentData: 'payment-data'
                    }
                }
            });

            const applepay = new ApplePay(global.core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                onPaymentFailed: onPaymentFailedMock,
                onSubmit(state, component, actions) {
                    actions.resolve({
                        resultCode: 'Refused',
                        error: {
                            applePayError: error
                        }
                    });
                }
            });

            applepay.submit();

            // Session initialized
            await new Promise(process.nextTick);
            expect(jest.spyOn(ApplePayService.prototype, 'begin')).toHaveBeenCalledTimes(1);

            // Trigger ApplePayService onPaymentAuthorized property
            // @ts-ignore ApplePayService is mocked
            const onPaymentAuthorized = ApplePayService.mock.calls[0][1].onPaymentAuthorized;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onPaymentAuthorized(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);
            expect(rejectMock).toHaveBeenCalledWith({
                errors: [error],
                status: 0
            });

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
        });

        test('should pass an empty error to ApplePay if action.reject is used without errors being passed to it', async () => {
            const onPaymentFailedMock = jest.fn();
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>({
                payment: {
                    token: {
                        paymentData: 'payment-data'
                    }
                }
            });

            const applepay = new ApplePay(global.core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                onPaymentFailed: onPaymentFailedMock,
                onSubmit(state, component, actions) {
                    actions.reject();
                }
            });

            applepay.submit();

            // Session initialized
            await new Promise(process.nextTick);
            expect(jest.spyOn(ApplePayService.prototype, 'begin')).toHaveBeenCalledTimes(1);

            // Trigger ApplePayService onPaymentAuthorized property
            // @ts-ignore ApplePayService is mocked
            const onPaymentAuthorized = ApplePayService.mock.calls[0][1].onPaymentAuthorized;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onPaymentAuthorized(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);
            expect(rejectMock).toHaveBeenCalledWith({
                errors: undefined,
                status: 0
            });

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentFailedMock).toHaveBeenCalledWith({ error: { applePayError: undefined } }, applepay);
        });
    });
    describe('onOrderTrackingRequest()', () => {
        test('should collect order details and pass it to Apple', async () => {
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>({
                payment: {
                    token: {
                        paymentData: 'payment-data'
                    }
                }
            });
            const onPaymentCompletedMock = jest.fn();
            const onOrderTrackingRequestMock = jest.fn().mockImplementation(resolve => {
                const orderDetails = {
                    orderTypeIdentifier: 'orderTypeIdentifier',
                    orderIdentifier: 'orderIdentifier',
                    webServiceURL: 'webServiceURL',
                    authenticationToken: 'authenticationToken'
                };
                resolve(orderDetails);
            });

            const applepay = new ApplePay(global.core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                onOrderTrackingRequest: onOrderTrackingRequestMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            jest.spyOn(applepay as any, 'makePaymentsCall').mockResolvedValue({
                resultCode: 'Authorized'
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // Trigger onPaymentAuthorized callback
            // @ts-ignore ApplePayService IS mocked
            const onPaymentAuthorized = ApplePayService.mock.calls[0][1].onPaymentAuthorized;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onPaymentAuthorized(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);
            expect(onOrderTrackingRequestMock).toHaveBeenCalledTimes(1);

            expect(resolveMock).toHaveBeenCalledWith({
                status: 1,
                orderDetails: {
                    orderTypeIdentifier: 'orderTypeIdentifier',
                    orderIdentifier: 'orderIdentifier',
                    webServiceURL: 'webServiceURL',
                    authenticationToken: 'authenticationToken'
                }
            });

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
        });

        test('should continue the payment if order details is omitted when resolving', async () => {
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>({
                payment: {
                    token: {
                        paymentData: 'payment-data'
                    }
                }
            });
            const onPaymentCompletedMock = jest.fn();
            const onOrderTrackingRequestMock = jest.fn().mockImplementation(resolve => {
                resolve();
            });

            const applepay = new ApplePay(global.core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                onOrderTrackingRequest: onOrderTrackingRequestMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            jest.spyOn(applepay as any, 'makePaymentsCall').mockResolvedValue({
                resultCode: 'Authorized'
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // Trigger onPaymentAuthorized callback
            // @ts-ignore ApplePayService IS mocked
            const onPaymentAuthorized = ApplePayService.mock.calls[0][1].onPaymentAuthorized;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onPaymentAuthorized(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);
            expect(onOrderTrackingRequestMock).toHaveBeenCalledTimes(1);

            expect(resolveMock).toHaveBeenCalledWith({
                status: 1
            });

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
        });

        test('should continue the payment if something goes wrong and order details callback is rejected', async () => {
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>({
                payment: {
                    token: {
                        paymentData: 'payment-data'
                    }
                }
            });
            const onPaymentCompletedMock = jest.fn();
            const onOrderTrackingRequestMock = jest.fn().mockImplementation((resolve, reject) => {
                reject();
            });

            const applepay = new ApplePay(global.core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                onOrderTrackingRequest: onOrderTrackingRequestMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            jest.spyOn(applepay as any, 'makePaymentsCall').mockResolvedValue({
                resultCode: 'Authorized'
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // Trigger onPaymentAuthorized callback
            // @ts-ignore ApplePayService IS mocked
            const onPaymentAuthorized = ApplePayService.mock.calls[0][1].onPaymentAuthorized;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onPaymentAuthorized(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);
            expect(onOrderTrackingRequestMock).toHaveBeenCalledTimes(1);

            expect(resolveMock).toHaveBeenCalledWith({
                status: 1
            });

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('onAuthorized()', () => {
        test('should provide event and formatted data, then reject payment', async () => {
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>({
                payment: {
                    billingContact: {
                        addressLines: ['802 Richardon Drive', 'Brooklyn'],
                        locality: 'New York',
                        administrativeArea: 'NY',
                        postalCode: '11213',
                        countryCode: 'US',
                        country: 'United States',
                        givenName: 'Jonny',
                        familyName: 'Smithson',
                        phoneticFamilyName: '',
                        phoneticGivenName: '',
                        subAdministrativeArea: '',
                        subLocality: ''
                    },
                    shippingContact: {
                        addressLines: ['1 Infinite Loop', 'Unit 100'],
                        locality: 'Cupertino',
                        administrativeArea: 'CA',
                        postalCode: '95014',
                        countryCode: 'US',
                        country: 'United States',
                        givenName: 'John',
                        familyName: 'Appleseed',
                        phoneticFamilyName: '',
                        phoneticGivenName: '',
                        subAdministrativeArea: '',
                        subLocality: ''
                    },
                    token: {
                        paymentData: 'payment-data'
                    }
                }
            });

            const onPaymentFailedMock = jest.fn();
            const onChangeMock = jest.fn();
            const onAuthorizedMock = jest.fn().mockImplementation((_data, actions) => {
                actions.reject();
            });

            const applepay = new ApplePay(global.core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                onAuthorized: onAuthorizedMock,
                onChange: onChangeMock,
                onPaymentFailed: onPaymentFailedMock
            });

            applepay.submit();

            // Session initialized
            await new Promise(process.nextTick);
            expect(jest.spyOn(ApplePayService.prototype, 'begin')).toHaveBeenCalledTimes(1);

            // Trigger onPaymentAuthorized callback
            // @ts-ignore ApplePayService IS mocked
            const onPaymentAuthorized = ApplePayService.mock.calls[0][1].onPaymentAuthorized;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onPaymentAuthorized(resolveMock, rejectMock, event);

            expect(onChangeMock).toHaveBeenCalledTimes(1);
            expect(onChangeMock.mock.calls[0][0].data).toStrictEqual({
                billingAddress: {
                    city: 'New York',
                    country: 'US',
                    houseNumberOrName: 'ZZ',
                    postalCode: '11213',
                    stateOrProvince: 'NY',
                    street: '802 Richardon Drive Brooklyn'
                },
                clientStateDataIndicator: true,
                deliveryAddress: {
                    city: 'Cupertino',
                    country: 'US',
                    firstName: 'John',
                    houseNumberOrName: 'ZZ',
                    lastName: 'Appleseed',
                    postalCode: '95014',
                    stateOrProvince: 'CA',
                    street: '1 Infinite Loop Unit 100'
                },
                paymentMethod: {
                    applePayToken: 'InBheW1lbnQtZGF0YSI=',
                    checkoutAttemptId: NO_CHECKOUT_ATTEMPT_ID,
                    type: 'applepay'
                }
            });

            const data = onAuthorizedMock.mock.calls[0][0];
            expect(data.authorizedEvent).toBe(event);
            expect(data.billingAddress).toStrictEqual({
                city: 'New York',
                country: 'US',
                houseNumberOrName: 'ZZ',
                postalCode: '11213',
                stateOrProvince: 'NY',
                street: '802 Richardon Drive Brooklyn'
            });
            expect(data.deliveryAddress).toStrictEqual({
                city: 'Cupertino',
                country: 'US',
                firstName: 'John',
                houseNumberOrName: 'ZZ',
                lastName: 'Appleseed',
                postalCode: '95014',
                stateOrProvince: 'CA',
                street: '1 Infinite Loop Unit 100'
            });

            await new Promise(process.nextTick);
            expect(rejectMock).toHaveBeenCalledWith({
                errors: undefined,
                status: 0
            });

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('formatProps', () => {
        test('accepts an amount in a regular format', () => {
            const applepay = new ApplePay(global.core, {
                amount: { currency: 'EUR', value: 2000 }
            });
            expect(applepay.props.amount.value).toEqual(2000);
            expect(applepay.props.amount.currency).toEqual('EUR');
        });

        test('accepts an amount with default values', () => {
            const applepay = new ApplePay(global.core);
            expect(applepay.props.amount.value).toEqual(0);
            expect(applepay.props.amount.currency).toEqual('USD');
        });

        test('uses merchantName if no totalPriceLabel was defined', () => {
            const applepay = new ApplePay(global.core, { configuration: { merchantName: 'Test' } });
            expect(applepay.props.totalPriceLabel).toEqual('Test');
        });

        test('can set totalPriceLabel', () => {
            const applepay = new ApplePay(global.core, {
                configuration: { merchantName: 'Test' },
                totalPriceLabel: 'Total'
            });
            expect(applepay.props.totalPriceLabel).toEqual('Total');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const applepay = new ApplePay(global.core);
            expect(applepay.data).toMatchObject({ paymentMethod: { type: 'applepay' } });
        });
    });
});
