import ApplePayService, { ApplePayServiceOptions } from './ApplePayService';
import { mock } from 'jest-mock-extended';

describe('ApplePaySession', () => {
    beforeEach(() => {
        window.ApplePaySession = jest.fn().mockImplementation((version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest) => ({
            version,
            paymentRequest,
            begin: jest.fn(),
            abort: jest.fn(),
            completeMerchantValidation: jest.fn(),
            completePayment: jest.fn(),
            completePaymentMethodSelection: jest.fn(),
            completeShippingContactSelection: jest.fn(),
            completeShippingMethodSelection: jest.fn(),
            supportsVersion: jest.fn().mockImplementation(v => v <= 5),
            canMakePayments: jest.fn().mockResolvedValue(true),
            onvalidatemerchant: undefined,
            onpaymentauthorized: jest.fn(),
            oncancel: jest.fn(),
            onpaymentmethodselected: jest.fn(),
            onshippingcontactselected: jest.fn(),
            onshippingmethodselected: jest.fn()
        })) as unknown as ApplePaySession;
    });

    afterEach(() => {
        delete window.ApplePaySession;
        jest.restoreAllMocks();
    });

    test('should create session passing version and payment request', () => {
        const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
        const options = mock<ApplePayServiceOptions>();
        options.version = 14;

        new ApplePayService(paymentRequest, options);

        expect(ApplePaySession).toHaveBeenCalledTimes(1);
        expect(ApplePaySession).toHaveBeenCalledWith(options.version, paymentRequest);
    });

    describe('onvalidatemerchant()', () => {
        test('should call "onValidateMerchant" and once the session is created calls "completeMerchantValidation"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const options = mock<ApplePayServiceOptions>({
                onValidateMerchant: jest.fn().mockImplementation(resolve => {
                    resolve('merchant-session');
                })
            });
            const event = mock<ApplePayJS.ApplePayValidateMerchantEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onvalidatemerchant(event);

            await new Promise(process.nextTick);

            expect(service['session'].completeMerchantValidation).toHaveBeenCalledWith('merchant-session');
        });

        test('should abort the session and report error when session creation fails', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const options = mock<ApplePayServiceOptions>({
                onValidateMerchant: jest.fn().mockImplementation((resolve, reject) => {
                    reject();
                })
            });
            const event = mock<ApplePayJS.ApplePayValidateMerchantEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onvalidatemerchant(event);

            await new Promise(process.nextTick);

            expect(service['session'].abort).toHaveBeenCalledTimes(1);
            expect(options.onError).toHaveBeenCalledTimes(1);
        });
    });

    describe('onpaymentauthorized()', () => {
        test('should call "onPaymentAuthorized" and once the payment is done it calls "completePayment"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const options = mock<ApplePayServiceOptions>({
                onPaymentAuthorized: jest.fn().mockImplementation(resolve => {
                    resolve({ status: 1 });
                })
            });
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onpaymentauthorized(event);

            await new Promise(process.nextTick);

            expect(service['session'].completePayment).toHaveBeenCalledWith({ status: 1 });
        });

        test('should call "onPaymentAuthorized" and if the payment is refused it calls "completePayment"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const options = mock<ApplePayServiceOptions>({
                onPaymentAuthorized: jest.fn().mockImplementation((resolve, reject) => {
                    reject({ status: 0 });
                })
            });
            const event = mock<ApplePayJS.ApplePayPaymentAuthorizedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onpaymentauthorized(event);

            await new Promise(process.nextTick);

            expect(service['session'].completePayment).toHaveBeenCalledWith({ status: 0 });
        });
    });

    describe('oncancel()', () => {
        test('should call "onCancel" callback when the cancel event is triggered', () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const options = mock<ApplePayServiceOptions>();
            const event = mock<ApplePayJS.Event>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].oncancel(event);

            expect(options.onCancel).toHaveBeenCalledWith(event);
        });
    });

    describe('begin()', () => {
        test('should call Apple Pay begin() event to start the validation process', () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const options = mock<ApplePayServiceOptions>();

            const service = new ApplePayService(paymentRequest, options);
            service.begin();

            expect(service['session'].begin).toHaveBeenCalledTimes(1);
        });
    });

    describe('onpaymentmethodselected()', () => {
        test('should call "onPaymentMethodSelected" and once the payment is resolved it calls "completePaymentMethodSelection"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const paymentMethodSelectResponse = mock<ApplePayJS.ApplePayPaymentMethodUpdate>();
            const options = mock<ApplePayServiceOptions>({
                onPaymentMethodSelected: jest.fn().mockImplementation(resolve => {
                    resolve(paymentMethodSelectResponse);
                })
            });
            const event = mock<ApplePayJS.ApplePayPaymentMethodSelectedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onpaymentmethodselected(event);

            await new Promise(process.nextTick);

            expect(service['session'].completePaymentMethodSelection).toHaveBeenCalledWith(paymentMethodSelectResponse);
        });

        test('should call "onPaymentMethodSelected" and if the change is refused it calls "completePaymentMethodSelection"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const paymentMethodSelectResponse = mock<ApplePayJS.ApplePayPaymentMethodUpdate>();
            const options = mock<ApplePayServiceOptions>({
                onPaymentMethodSelected: jest.fn().mockImplementation((resolve, reject) => {
                    reject(paymentMethodSelectResponse);
                })
            });
            const event = mock<ApplePayJS.ApplePayPaymentMethodSelectedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onpaymentmethodselected(event);

            await new Promise(process.nextTick);

            expect(service['session'].completePaymentMethodSelection).toHaveBeenCalledWith(paymentMethodSelectResponse);
        });
    });

    describe('onshippingcontactselected()', () => {
        test('should call "onShippingContactSelected" and once the change is resolved it calls "completeShippingContactSelection"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const shippingContactUpdateMock = mock<ApplePayJS.ApplePayShippingContactUpdate>();
            const options = mock<ApplePayServiceOptions>({
                onShippingContactSelected: jest.fn().mockImplementation(resolve => {
                    resolve(shippingContactUpdateMock);
                })
            });
            const event = mock<ApplePayJS.ApplePayShippingContactSelectedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onshippingcontactselected(event);

            await new Promise(process.nextTick);

            expect(service['session'].completeShippingContactSelection).toHaveBeenCalledWith(shippingContactUpdateMock);
        });

        test('should call "onShippingContactSelected" and if the change is refused it calls "completeShippingContactSelection"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const shippingContactUpdateMock = mock<ApplePayJS.ApplePayShippingContactUpdate>();
            const options = mock<ApplePayServiceOptions>({
                onShippingContactSelected: jest.fn().mockImplementation((resolve, reject) => {
                    reject(shippingContactUpdateMock);
                })
            });
            const event = mock<ApplePayJS.ApplePayShippingContactSelectedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onshippingcontactselected(event);

            await new Promise(process.nextTick);

            expect(service['session'].completeShippingContactSelection).toHaveBeenCalledWith(shippingContactUpdateMock);
        });
    });

    describe('onshippingmethodselected', () => {
        test('should call "onShippingMethodSelected" and once the change is resolved it calls "completeShippingMethodSelection"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const shippingMethodUpdateMock = mock<ApplePayJS.ApplePayShippingMethodSelectedEvent>();
            const options = mock<ApplePayServiceOptions>({
                onShippingMethodSelected: jest.fn().mockImplementation(resolve => {
                    resolve(shippingMethodUpdateMock);
                })
            });
            const event = mock<ApplePayJS.ApplePayShippingMethodSelectedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onshippingmethodselected(event);

            await new Promise(process.nextTick);

            expect(service['session'].completeShippingMethodSelection).toHaveBeenCalledWith(shippingMethodUpdateMock);
        });

        test('should call "onShippingMethodSelected" and if the change is refused it calls "completeShippingMethodSelection"', async () => {
            const paymentRequest = mock<ApplePayJS.ApplePayPaymentRequest>();
            const shippingMethodUpdateMock = mock<ApplePayJS.ApplePayShippingMethodSelectedEvent>();
            const options = mock<ApplePayServiceOptions>({
                onShippingMethodSelected: jest.fn().mockImplementation((resolve, reject) => {
                    reject(shippingMethodUpdateMock);
                })
            });
            const event = mock<ApplePayJS.ApplePayShippingMethodSelectedEvent>();

            const service = new ApplePayService(paymentRequest, options);
            service['session'].onshippingmethodselected(event);

            await new Promise(process.nextTick);

            expect(service['session'].completeShippingMethodSelection).toHaveBeenCalledWith(shippingMethodUpdateMock);
        });
    });
});
