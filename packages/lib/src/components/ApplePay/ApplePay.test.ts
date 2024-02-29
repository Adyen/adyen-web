import ApplePay from './ApplePay';
import ApplePayService from './ApplePayService';
import { mock } from 'jest-mock-extended';

jest.mock('./ApplePayService');

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    ApplePayService.mockClear();
    jest.resetModules();
    jest.resetAllMocks();

    window.ApplePaySession = {
        // @ts-ignore Mock ApplePaySession.STATUS_SUCCESS STATUS_FAILURE
        STATUS_SUCCESS: 1,
        STATUS_FAILURE: 0,
        supportsVersion: () => true
    };
});

describe('ApplePay', () => {
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
                    checkoutAttemptId: 'do-not-track',
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
