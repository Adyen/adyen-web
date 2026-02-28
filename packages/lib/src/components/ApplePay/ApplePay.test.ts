import { httpPost } from '../../core/Services/http';
import ApplePay from './ApplePay';
import ApplePayService from './services/ApplePayService';
import ApplePaySdkLoader from './services/ApplePaySdkLoader';
import { mock } from 'jest-mock-extended';
import { render, screen } from '@testing-library/preact';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../config/testMocks/setup-core-mock';
import { ICore } from '../../types';

jest.mock('../../core/Services/http');
jest.mock('./services/ApplePayService');
jest.mock('./services/ApplePaySdkLoader');

const mockedHttpPost = httpPost as jest.Mock;

let mockApplePaySession;
let core: ICore;

beforeEach(() => {
    core = setupCoreMock();
    const mockApplePaySdkLoaderLoadFunction = jest.fn().mockImplementation(() => {
        mockApplePaySession = mock<ApplePaySession>({
            // @ts-ignore The following methods are not recognized as static members
            canMakePayments: jest.fn().mockReturnValue(true),
            applePayCapabilities: jest.fn().mockResolvedValue({}),
            supportsVersion: jest.fn().mockImplementation(() => true),
            STATUS_SUCCESS: 1,
            STATUS_FAILURE: 0
        });

        // @ts-ignore ApplePaySession does exist
        global.ApplePaySession = mockApplePaySession;

        Object.defineProperty(window, 'ApplePayWebOptions', {
            writable: true,
            value: {
                set: jest.fn()
            }
        });

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
    mockedHttpPost.mockClear();

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
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'https:'
                }
            });

            const onApplePayCodeCloseMock = jest.fn();
            new ApplePay(core, {
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

    describe('showPayButton', () => {
        test('should not render anything if showPayButton is false', () => {
            const applepay = new ApplePay(core, {
                showPayButton: false
            });
            render(applepay.render());
            expect(screen.queryByTestId('apple-pay-button')).not.toBeInTheDocument();
        });

        test('should render apple-pay-button by default', () => {
            const applepay = new ApplePay(core);
            render(applepay.render());
            expect(screen.getByTestId('apple-pay-button')).toBeInTheDocument();
        });
    });

    describe('isAvailable()', () => {
        test('should use canMakePayments() API', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'https:'
                }
            });

            const applepay = new ApplePay(core);
            await expect(applepay.isAvailable()).resolves.toBeUndefined();
            expect(ApplePaySession.canMakePayments).toHaveBeenCalledTimes(1);
        });

        test('should reject if the page is not https', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'http:'
                }
            });

            const applepay = new ApplePay(core);
            await expect(applepay.isAvailable()).rejects.toThrow('Trying to start an Apple Pay session from an insecure document');
        });

        test('should reject if canMakePayments() returns false', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    protocol: 'https:'
                }
            });

            const applepay = new ApplePay(core);
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

            const applepay = new ApplePay(core);
            await new Promise(process.nextTick);

            applepay['sdkLoader'].isSdkLoaded = jest.fn().mockRejectedValue(undefined);

            await expect(applepay.isAvailable()).rejects.toThrow('Apple Pay SDK failed to load');
        });
    });

    describe('applePayCapabilities()', () => {
        test('should call the applePayCapabilities() API with the merchant config', async () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock
            });

            await expect(applepay.applePayCapabilities()).resolves.toEqual({});
            expect(mockApplePaySession.applePayCapabilities).toHaveBeenCalledTimes(1);
            expect(mockApplePaySession.applePayCapabilities).toHaveBeenCalledWith(configurationMock.merchantId);
        });

        test('should throw error if applePayCapabilities() fails', async () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock
            });
            mockApplePaySession.applePayCapabilities = jest.fn().mockRejectedValue({});

            await expect(applepay.applePayCapabilities()).rejects.toThrow('Apple Pay: Error when requesting applePayCapabilities()');
        });
    });

    describe('validateMerchant()', () => {
        test('should pass decoded token back to Apple Pay', async () => {
            mockedHttpPost.mockResolvedValue({
                data: 'eyJ0b2tlbiI6ImFwcGxlLXBheS1zZXNzaW9uIn0=' // translates to: {"token":"apple-pay-session"}
            });

            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 }
            });

            applepay.submit();

            // Session initialized
            await new Promise(process.nextTick);
            expect(jest.spyOn(ApplePayService.prototype, 'begin')).toHaveBeenCalledTimes(1);

            // @ts-ignore  ApplePayService is mocked. Trigger ApplePayService onValidateMerchant property
            const onValidateMerchant = ApplePayService.mock.calls[0][1].onValidateMerchant;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onValidateMerchant(resolveMock, rejectMock);

            await new Promise(process.nextTick);

            expect(resolveMock).toHaveBeenCalledWith({ token: 'apple-pay-session' });
        });

        test('should use the current URL as default', () => {
            const originalHostname = window.location.hostname;
            Object.defineProperty(window.location, 'hostname', {
                value: 'adyen.dev',
                configurable: true
            });

            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 }
            });

            applepay.submit();

            // @ts-ignore ApplePayService is mocked. Trigger ApplePayService onValidateMerchant property
            const onValidateMerchant = ApplePayService.mock.calls[0][1].onValidateMerchant;
            onValidateMerchant(jest.fn(), jest.fn());

            expect(mockedHttpPost).toHaveBeenCalledWith(expect.anything(), {
                displayName: 'TestMerchant',
                domainName: 'adyen.dev',
                initiative: 'web',
                merchantIdentifier: 'test-merchant'
            });

            // Restoring original value
            Object.defineProperty(window.location, 'hostname', {
                value: originalHostname,
                configurable: true
            });
        });

        test('should use custom domainName if set in the component configuration', () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                domainName: 'https://pay.example.com',
                amount: { currency: 'EUR', value: 2000 }
            });

            applepay.submit();

            // @ts-ignore ApplePayService is mocked. Trigger ApplePayService onValidateMerchant property
            const onValidateMerchant = ApplePayService.mock.calls[0][1].onValidateMerchant;
            onValidateMerchant(jest.fn(), jest.fn());

            expect(mockedHttpPost).toHaveBeenCalledWith(expect.anything(), {
                displayName: 'TestMerchant',
                domainName: 'https://pay.example.com',
                initiative: 'web',
                merchantIdentifier: 'test-merchant'
            });
        });

        test('should reject if the session request fails', async () => {
            mockedHttpPost.mockRejectedValue({});

            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 }
            });

            applepay.submit();

            // Session initialized
            await new Promise(process.nextTick);
            expect(jest.spyOn(ApplePayService.prototype, 'begin')).toHaveBeenCalledTimes(1);

            // Trigger ApplePayService onValidateMerchant property
            // @ts-ignore ApplePayService is mocked
            const onValidateMerchant = ApplePayService.mock.calls[0][1].onValidateMerchant;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            onValidateMerchant(resolveMock, rejectMock);

            await new Promise(process.nextTick);

            expect(rejectMock).toHaveBeenCalledWith('Could not get Apple Pay session');
        });
    });

    describe('isExpress flag', () => {
        test('should add subtype: express when isExpress is configured', () => {
            const applepay = new ApplePay(core, { isExpress: true });
            expect(applepay.data.paymentMethod).toHaveProperty('subtype', 'express');
        });
        test('should not add subtype: express when isExpress is omitted', () => {
            const applepay = new ApplePay(core);
            expect(applepay.data.paymentMethod).not.toHaveProperty('subtype', 'express');
        });

        test('should throw error when express callbacks are passed but isExpress flag is not set', () => {
            expect(() => new ApplePay(core, { onShippingContactSelected: jest.fn() })).toThrow();
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

            const applepay = new ApplePay(core, {
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

            const applepay = new ApplePay(core, {
                modules: { analytics: global.analytics },
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

            const applepay = new ApplePay(core, {
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

            const applepay = new ApplePay(core, {
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

            const applepay = new ApplePay(core, {
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

            const applepay = new ApplePay(core, {
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
                    checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                    sdkData: expect.any(String),
                    type: 'applepay'
                },
                riskData: {
                    clientData: TEST_RISK_DATA
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
            const applepay = new ApplePay(core, {
                amount: { currency: 'EUR', value: 2000 }
            });
            expect(applepay.props.amount.value).toEqual(2000);
            expect(applepay.props.amount.currency).toEqual('EUR');
        });

        test('accepts an amount with default values', () => {
            const applepay = new ApplePay(core);
            expect(applepay.props.amount.value).toEqual(0);
            expect(applepay.props.amount.currency).toEqual('USD');
        });

        test('uses merchantName if no totalPriceLabel was defined', () => {
            const applepay = new ApplePay(core, { configuration: { merchantName: 'Test' } });
            expect(applepay.props.totalPriceLabel).toEqual('Test');
        });

        test('can set totalPriceLabel', () => {
            const applepay = new ApplePay(core, {
                configuration: { merchantName: 'Test' },
                totalPriceLabel: 'Total'
            });
            expect(applepay.props.totalPriceLabel).toEqual('Total');
        });
    });

    describe('get data', () => {
        test('always returns a type', () => {
            const applepay = new ApplePay(core);
            expect(applepay.data).toMatchObject({ paymentMethod: { type: 'applepay' } });
        });
    });

    describe('coupon code support', () => {
        test('should pass couponCode and supportsCouponCode to the Apple Pay payment request', async () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                couponCode: 'DISCOUNT10',
                supportsCouponCode: true
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // @ts-ignore ApplePayService is mocked
            const paymentRequest = ApplePayService.mock.calls[0][0];
            expect(paymentRequest.couponCode).toBe('DISCOUNT10');
            expect(paymentRequest.supportsCouponCode).toBe(true);
        });

        test('should not include couponCode and supportsCouponCode in the payment request when not provided', async () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 }
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // @ts-ignore ApplePayService is mocked
            const paymentRequest = ApplePayService.mock.calls[0][0];
            expect(paymentRequest.couponCode).toBeUndefined();
            expect(paymentRequest.supportsCouponCode).toBeUndefined();
        });

        test('should pass onCouponCodeChange callback to ApplePayService', async () => {
            const onCouponCodeChangeMock = jest.fn();

            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                supportsCouponCode: true,
                onCouponCodeChange: onCouponCodeChangeMock
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // @ts-ignore ApplePayService is mocked
            const serviceOptions = ApplePayService.mock.calls[0][1];
            expect(serviceOptions.onCouponCodeChange).toBe(onCouponCodeChangeMock);
        });

        test('should not pass onCouponCodeChange to ApplePayService when not provided', async () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 }
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // @ts-ignore ApplePayService is mocked
            const serviceOptions = ApplePayService.mock.calls[0][1];
            expect(serviceOptions.onCouponCodeChange).toBeUndefined();
        });

        test('should call resolve with the coupon code update when the merchant resolves', async () => {
            const couponCodeUpdate = {
                newTotal: { label: 'Total', amount: '15.00' }
            };

            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                supportsCouponCode: true,
                onCouponCodeChange: (resolve, _reject, _event) => {
                    resolve(couponCodeUpdate);
                }
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // @ts-ignore ApplePayService is mocked
            const onCouponCodeChange = ApplePayService.mock.calls[0][1].onCouponCodeChange;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            const event = { couponCode: 'DISCOUNT10' } as ApplePayJS.ApplePayCouponCodeChangedEvent;
            onCouponCodeChange(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);

            expect(resolveMock).toHaveBeenCalledWith(couponCodeUpdate);
            expect(rejectMock).not.toHaveBeenCalled();
        });

        test('should call reject when the merchant rejects the coupon code change', async () => {
            const applepay = new ApplePay(core, {
                configuration: configurationMock,
                amount: { currency: 'EUR', value: 2000 },
                supportsCouponCode: true,
                onCouponCodeChange: (_resolve, reject, _event) => {
                    reject({ newTotal: { label: 'Total', amount: '20.00' } });
                }
            });

            applepay.submit();

            await new Promise(process.nextTick);

            // @ts-ignore ApplePayService is mocked
            const onCouponCodeChange = ApplePayService.mock.calls[0][1].onCouponCodeChange;
            const resolveMock = jest.fn();
            const rejectMock = jest.fn();
            const event = { couponCode: 'INVALID' } as ApplePayJS.ApplePayCouponCodeChangedEvent;
            onCouponCodeChange(resolveMock, rejectMock, event);

            await new Promise(process.nextTick);

            expect(resolveMock).not.toHaveBeenCalled();
            expect(rejectMock).toHaveBeenCalled();
        });
    });
});
