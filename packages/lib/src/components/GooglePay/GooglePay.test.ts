import GooglePay from './GooglePay';
import GooglePayService from './GooglePayService';

import Analytics from '../../core/Analytics';
import { ANALYTICS_EVENT_INFO, ANALYTICS_SELECTED_STR } from '../../core/Analytics/constants';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '' });

jest.mock('./GooglePayService');

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    GooglePayService.mockClear();
    jest.resetModules();
    jest.resetAllMocks();
});

let googlePaymentData: Partial<google.payments.api.PaymentData> = {};

beforeEach(() => {
    googlePaymentData = {
        apiVersionMinor: 0,
        apiVersion: 2,
        paymentMethodData: {
            description: 'Visa •••• 1111',
            tokenizationData: {
                type: 'PAYMENT_GATEWAY',
                token: 'google-pay-token'
            },
            type: 'CARD',
            info: {
                cardNetwork: 'VISA',
                cardDetails: '1111',
                // @ts-ignore Complaining about missing fields, although Google returned only these
                billingAddress: {
                    countryCode: 'US',
                    postalCode: '94043',
                    name: 'Card Holder Name'
                }
            }
        },
        shippingAddress: {
            address3: '',
            sortingCode: '',
            address2: '',
            countryCode: 'US',
            address1: '1600 Amphitheatre Parkway1',
            postalCode: '94043',
            name: 'US User',
            locality: 'Mountain View',
            administrativeArea: 'CA'
        },
        email: 'shopper@gmail.com'
    };
});

describe('GooglePay', () => {
    describe('submit()', () => {
        test('should make the payments call passing deliveryAddress and billingAddress', async () => {
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Authorized'
                });
            });
            const onPaymentCompletedMock = jest.fn();

            const gpay = new GooglePay(global.core, {
                onSubmit: onSubmitMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            const promise = onPaymentAuthorized(googlePaymentData);

            await new Promise(process.nextTick);
            expect(onSubmitMock).toHaveBeenCalledTimes(1);

            const state = onSubmitMock.mock.calls[0][0];

            expect(state.data.origin).toBe('http://localhost');
            expect(state.data.paymentMethod).toStrictEqual({
                checkoutAttemptId: 'do-not-track',
                googlePayCardNetwork: 'VISA',
                googlePayToken: 'google-pay-token',
                type: 'googlepay'
            });
            expect(state.data.deliveryAddress).toStrictEqual({
                city: 'Mountain View',
                country: 'US',
                firstName: 'US User',
                houseNumberOrName: 'ZZ',
                postalCode: '94043',
                stateOrProvince: 'CA',
                street: '1600 Amphitheatre Parkway1'
            });
            expect(state.data.billingAddress).toStrictEqual({
                city: '',
                country: 'US',
                houseNumberOrName: 'ZZ',
                postalCode: '94043',
                street: ''
            });

            const browserInfo = state.data.browserInfo;

            expect(browserInfo.colorDepth).toEqual(expect.any(Number));
            expect(browserInfo.javaEnabled).toEqual(expect.any(Boolean));
            expect(browserInfo.language).toEqual(expect.any(String));
            expect(browserInfo.screenHeight).toEqual('');
            expect(browserInfo.screenWidth).toEqual('');
            expect(browserInfo.timeZoneOffset).toEqual(expect.any(Number));
            expect(browserInfo.userAgent).toEqual(expect.any(String));

            await new Promise(process.nextTick);

            expect(promise).resolves.toEqual({
                transactionState: 'SUCCESS'
            });

            expect(onPaymentCompletedMock).toHaveBeenCalledWith({ resultCode: 'Authorized' }, gpay);
        });

        test('should not add deliveryAddress and billingAddress if they are not available', async () => {
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Authorized'
                });
            });

            new GooglePay(global.core, {
                onSubmit: onSubmitMock
            });

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            const googlePaymentDataWithoutAddresses = { ...googlePaymentData };
            delete googlePaymentDataWithoutAddresses.shippingAddress;
            delete googlePaymentDataWithoutAddresses.paymentMethodData.info.billingAddress;
            onPaymentAuthorized(googlePaymentDataWithoutAddresses);

            await new Promise(process.nextTick);
            expect(onSubmitMock).toHaveBeenCalledTimes(1);

            const state = onSubmitMock.mock.calls[0][0];

            expect(state.data.origin).toBe('http://localhost');
            expect(state.data.paymentMethod).toStrictEqual({
                checkoutAttemptId: 'do-not-track',
                googlePayCardNetwork: 'VISA',
                googlePayToken: 'google-pay-token',
                type: 'googlepay'
            });
            expect(state.data.deliveryAddress).toBeUndefined();
            expect(state.data.billingAddress).toBeUndefined();
        });

        test('should pass error to GooglePay if payment failed', async () => {
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Refused',
                    error: {
                        googlePayError: 'Insufficient funds'
                    }
                });
            });
            const onPaymentFailedMock = jest.fn();

            const gpay = new GooglePay(global.core, {
                i18n: global.i18n,
                onSubmit: onSubmitMock,
                onPaymentFailed: onPaymentFailedMock
            });

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            const promise = onPaymentAuthorized(googlePaymentData);

            await new Promise(process.nextTick);

            expect(promise).resolves.toEqual({
                error: {
                    intent: 'PAYMENT_AUTHORIZATION',
                    message: 'Insufficient funds',
                    reason: 'OTHER_ERROR'
                },
                transactionState: 'ERROR'
            });

            expect(onPaymentFailedMock).toHaveBeenCalledWith({ resultCode: 'Refused', error: { googlePayError: 'Insufficient funds' } }, gpay);
        });
    });

    describe('onAuthorized()', () => {
        const event = {
            authorizedEvent: {
                apiVersionMinor: 0,
                apiVersion: 2,
                paymentMethodData: {
                    description: 'Visa •••• 1111',
                    tokenizationData: {
                        type: 'PAYMENT_GATEWAY',
                        token: 'google-pay-token'
                    },
                    type: 'CARD',
                    info: {
                        cardNetwork: 'VISA',
                        cardDetails: '1111',
                        billingAddress: {
                            countryCode: 'US',
                            postalCode: '94043',
                            name: 'Card Holder Name'
                        }
                    }
                },
                shippingAddress: {
                    address3: '',
                    sortingCode: '',
                    address2: '',
                    countryCode: 'US',
                    address1: '1600 Amphitheatre Parkway1',
                    postalCode: '94043',
                    name: 'US User',
                    locality: 'Mountain View',
                    administrativeArea: 'CA'
                },
                email: 'shopper@gmail.com'
            },
            billingAddress: {
                postalCode: '94043',
                country: 'US',
                street: '',
                houseNumberOrName: 'ZZ',
                city: ''
            },
            deliveryAddress: {
                postalCode: '94043',
                country: 'US',
                street: '1600 Amphitheatre Parkway1',
                houseNumberOrName: 'ZZ',
                city: 'Mountain View',
                stateOrProvince: 'CA',
                firstName: 'US User'
            }
        };

        test('should provide GooglePay auth event and formatted data', () => {
            const onAuthorizedMock = jest.fn();
            new GooglePay(global.core, { onAuthorized: onAuthorizedMock });

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            onPaymentAuthorized(googlePaymentData);

            expect(onAuthorizedMock.mock.calls[0][0]).toStrictEqual(event);
        });

        test('should pass error to GooglePay if the action.reject happens on onAuthorized', async () => {
            const onAuthorizedMock = jest.fn().mockImplementation((_data, actions) => {
                actions.reject('Not supported network scheme');
            });
            const onPaymentFailedMock = jest.fn();

            new GooglePay(global.core, {
                i18n: global.i18n,
                onAuthorized: onAuthorizedMock,
                onPaymentFailed: onPaymentFailedMock
            });

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            const promise = onPaymentAuthorized(googlePaymentData);

            expect(promise).resolves.toEqual({
                error: {
                    intent: 'PAYMENT_AUTHORIZATION',
                    message: 'Not supported network scheme',
                    reason: 'OTHER_ERROR'
                },
                transactionState: 'ERROR'
            });

            await new Promise(process.nextTick);
            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
        });

        test('should continue the payment flow if action.resolve happens on onAuthorized', async () => {
            const onAuthorizedMock = jest.fn().mockImplementation((_data, actions) => {
                actions.resolve();
            });
            const onPaymentCompletedMock = jest.fn();

            const gpay = new GooglePay(global.core, {
                i18n: global.i18n,
                onAuthorized: onAuthorizedMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            const paymentCall = jest.spyOn(gpay as any, 'makePaymentsCall');

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            onPaymentAuthorized(googlePaymentData);

            await new Promise(process.nextTick);
            expect(paymentCall).toHaveBeenCalledTimes(1);
        });

        test('should make the payments call if onAuthorized is not provided', async () => {
            const gpay = new GooglePay(global.core, { i18n: global.i18n });

            const paymentCall = jest.spyOn(gpay as any, 'makePaymentsCall');

            // @ts-ignore GooglePayService is mocked
            const onPaymentAuthorized = GooglePayService.mock.calls[0][0].paymentDataCallbacks.onPaymentAuthorized;
            onPaymentAuthorized(googlePaymentData);

            await new Promise(process.nextTick);
            expect(paymentCall).toHaveBeenCalledTimes(1);
        });
    });

    describe('isAvailable()', () => {
        test('should resolve if GooglePay is available', async () => {
            const gpay = new GooglePay(global.core);
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true });
            });

            await expect(gpay.isAvailable()).resolves.not.toThrow();
        });

        test('should reject if is not available', async () => {
            const gpay = new GooglePay(global.core);
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: false });
            });

            await expect(gpay.isAvailable()).rejects.toThrow();
        });

        test('should reject if "paymentMethodPresent" is false', async () => {
            const gpay = new GooglePay(global.core);
            gpay.isReadyToPay = jest.fn(() => {
                return Promise.resolve({ result: true, paymentMethodPresent: false });
            });

            await expect(gpay.isAvailable()).rejects.toThrow();
        });
    });

    describe('Process CA based configuration data', () => {
        test('Retrieves default merchantId', () => {
            const gpay = new GooglePay(global.core);
            expect(gpay.props.configuration.merchantId).toEqual('');
        });

        test('Retrieves merchantId from configuration', () => {
            const gpay = new GooglePay(global.core, { configuration: { merchantId: 'abcdef', gatewayMerchantId: 'TestMerchant' } });
            expect(gpay.props.configuration.merchantId).toEqual('abcdef');
        });

        test('Retrieves merchantId from configuration', () => {
            const gpay = new GooglePay(global.core, {
                configuration: {
                    gatewayMerchantId: 'TestMerchant',
                    merchantOrigin: 'example.com'
                }
            });
            expect(gpay.props.configuration.merchantOrigin).toEqual('example.com');
        });

        test('Retrieves authJwt from configuration', () => {
            const gpay = new GooglePay(global.core, {
                configuration: { merchantId: 'abcdef', gatewayMerchantId: 'TestMerchant', authJwt: 'jwt.code' }
            });
            expect(gpay.props.configuration.authJwt).toEqual('jwt.code');
        });
    });

    describe('GooglePay: calls that generate "info" analytics should produce objects with the expected shapes ', () => {
        let gpay;
        beforeEach(() => {
            console.log = jest.fn(() => {});

            gpay = new GooglePay({
                core: null,
                type: 'googlepay',
                isInstantPayment: true,
                modules: {
                    analytics: analyticsModule
                }
            });

            analyticsModule.createAnalyticsEvent = jest.fn(obj => {
                console.log('### analyticsPreProcessor.test:::: obj=', obj);
            });
        });

        test('Analytics should produce an "info" event, of type "selected", for GooglePay as an instant PM', () => {
            gpay.submit();

            expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
                event: ANALYTICS_EVENT_INFO,
                data: {
                    component: gpay.props.type,
                    type: ANALYTICS_SELECTED_STR,
                    target: 'instant_payment_button'
                }
            });
        });
    });
});
