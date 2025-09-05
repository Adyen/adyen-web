import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PayByBankPix from './PayByBankPix';
import { PasskeyService } from './services/PasskeyService';
import { TxVariants } from '../tx-variants';
import { httpGet, httpPost } from '../../core/Services/http';
import { SRPanel } from '../../core/Errors/SRPanel';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

jest.mock('./services/PasskeyService');
jest.mock('../../core/Services/http');

let httpGetMock = (httpGet as jest.Mock).mockImplementation(
    jest.fn(() =>
        Promise.resolve({
            resultCode: 'pending'
        })
    )
);
let httpPostMock = (httpPost as jest.Mock).mockImplementation(
    jest.fn(() =>
        Promise.resolve({
            action: {}
        })
    )
);
const riskSignals = {
    deviceId: 'mock-device',
    osVersion: 'xxx',
    userTimeZoneOffset: -60,
    language: 'en-US',
    screenDimensions: { width: 100, height: 100 }
};
const mockInitialize = jest.fn().mockResolvedValue(undefined);
const getWebAuthnUnsupportedReasonMock = jest.fn().mockResolvedValue('');
const mockRiskSignals = jest.fn().mockResolvedValue(riskSignals);
const mockCreateCredential = jest.fn().mockResolvedValue('mock-fidoAssertion');
const canUseStoredCredentialMock = jest.fn().mockResolvedValue(true);

(PasskeyService as jest.Mock).mockImplementation(() => ({
    getWebAuthnUnsupportedReason: getWebAuthnUnsupportedReasonMock,
    initialize: mockInitialize,
    captureRiskSignalsEnrollment: mockRiskSignals,
    captureRiskSignalsAuthentication: mockRiskSignals,
    createCredentialForEnrollment: mockCreateCredential,
    authenticateWithCredential: mockCreateCredential,
    canUseStoredCredential: canUseStoredCredentialMock
}));

const user = userEvent.setup();
const coreProps = {
    i18n: global.i18n,
    loadingContext: 'test',
    modules: { resources: global.resources, srPanel: global.srPanel, analytics: global.analytics }
};

describe('PayByBankPix', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should render a redirect button on the merchant's page", async () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            ...coreProps,
            _isAdyenHosted: false
        });

        render(payByBankPixElement.render());
        expect(await screen.findByRole('button', { name: /Continue to Pix through OpenBanking/i })).toBeInTheDocument();
    });

    test("should always be valid on the merchant's page", () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            ...coreProps,
            _isAdyenHosted: false
        });

        expect(payByBankPixElement.isValid).toBe(true);
    });

    test("should format the correct data on the merchant's page", () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            ...coreProps,
            _isAdyenHosted: false
        });

        expect(payByBankPixElement.formatData()).toEqual({ paymentMethod: { type: TxVariants.paybybank_pix } });
    });

    test('isAvailable should reject if there are any WebAuthnUnsupported reasons', async () => {
        getWebAuthnUnsupportedReasonMock.mockResolvedValue('unsupported');
        const payByBankPixElement = new PayByBankPix(global.core, {
            ...coreProps,
            _isAdyenHosted: false
        });
        await expect(payByBankPixElement.isAvailable()).rejects.toThrow('unsupported');
        getWebAuthnUnsupportedReasonMock.mockReset();
    });

    test('isAvailable should reject if initialize fails', async () => {
        const element = new PayByBankPix(global.core, {
            ...coreProps,
            _isAdyenHosted: true
        });
        const error = new Error('Init fail');
        mockInitialize.mockRejectedValueOnce(error);
        await expect(element.isAvailable()).rejects.toBe('Init fail');
    });

    test('isAvailable should resolve if there is no WebAuthnUnsupported reasons', async () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            ...coreProps,
            _isAdyenHosted: false
        });
        await expect(payByBankPixElement.isAvailable()).resolves.toBe(undefined);
    });

    describe('Enrollment flow', () => {
        let payByBankPixElement: PayByBankPix;
        const onChangeMock = jest.fn();
        const onAdditionalDetailsMock = jest.fn();

        beforeEach(() => {
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                onChange: onChangeMock,
                _isAdyenHosted: true,
                issuers: [{ name: 'Iniciador Mock Bank', id: '123' }]
            });
        });

        test('isAvailable should call getWebAuthnUnsupportedReason and initialize of PasskeyService', async () => {
            await payByBankPixElement.isAvailable();

            expect(mockInitialize).toHaveBeenCalled();
            expect(getWebAuthnUnsupportedReasonMock).toHaveBeenCalled();
        });

        test('should render an issuer list on the hosted page', async () => {
            render(payByBankPixElement.render());
            expect(await screen.findByRole('listbox')).toBeInTheDocument();
            expect(await screen.findByRole('option', { name: /Iniciador Mock Bank/i })).toBeInTheDocument();
        });

        test('should call captureRiskSignalsEnrollment and onChange after one issuer is selected', async () => {
            render(payByBankPixElement.render());

            await user.click(await screen.findByRole('listbox'));
            await user.click(await screen.findByRole('option', { name: /Iniciador Mock Bank/i }));

            await waitFor(() => {
                expect(onChangeMock).toHaveBeenCalledWith(
                    {
                        data: {
                            clientStateDataIndicator: true,
                            paymentMethod: {
                                checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                                deviceId: 'mock-device',
                                issuer: '123',
                                riskSignals: {
                                    language: 'en-US',
                                    osVersion: 'xxx',
                                    screenDimensions: { height: 100, width: 100 },
                                    userTimeZoneOffset: -60
                                },
                                type: 'paybybank_pix'
                            },
                            storePaymentMethod: true
                        },
                        errors: { issuer: null },
                        isValid: true,
                        valid: { issuer: true }
                    },
                    expect.anything()
                );
            });
        });

        test('should render the Await for the await action', async () => {
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                _isAdyenHosted: true,
                type: 'await'
            });
            render(payByBankPixElement.render());
            expect(await screen.findByText('Waiting for your confirmation...')).toBeInTheDocument();
        });

        test('should poll the correct endpoint during the Await process', async () => {
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                _isAdyenHosted: true,
                type: 'await',
                paymentMethodData: { enrollmentId: 'mock-enrollment-id' },
                clientKey: 'mock-client-key'
            });
            render(payByBankPixElement.render());
            await waitFor(() =>
                expect(httpGetMock).toHaveBeenCalledWith({
                    loadingContext: 'test',
                    path: 'utility/v1/pixpaybybank/registration-options/mock-enrollment-id?clientKey=mock-client-key',
                    timeout: 10000
                })
            );
        });

        test('should call createCredentialForEnrollment of the passkeyService and authorizeEnrollment endpoint, when registrationOptions is available', async () => {
            httpGetMock.mockReset();
            httpGetMock = (httpGet as jest.Mock).mockImplementation(
                jest.fn(() =>
                    Promise.resolve({
                        resultCode: 'received',
                        registrationOptions: 'mock-registration-options'
                    })
                )
            );
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                _isAdyenHosted: true,
                type: 'await',
                paymentMethodData: { enrollmentId: 'mock-enrollment-id' },
                clientKey: 'mock-client-key'
            });
            render(payByBankPixElement.render());
            await waitFor(() => expect(mockCreateCredential).toHaveBeenCalledWith('mock-registration-options'));
            await waitFor(() =>
                expect(httpPostMock).toHaveBeenCalledWith(
                    { loadingContext: 'test', path: 'utility/v1/pixpaybybank/redirect-result?clientKey=mock-client-key', timeout: 10000 },
                    { enrollmentId: 'mock-enrollment-id', fidoAssertion: 'mock-fidoAssertion' }
                )
            );
        });

        test('should call onAdditionalDetails callback - for the advanced flow, when authorizeEnrollment returns redirectResult', async () => {
            httpGetMock.mockReset();
            httpPostMock.mockReset();
            httpGetMock = (httpGet as jest.Mock).mockImplementation(
                jest.fn(() =>
                    Promise.resolve({
                        resultCode: 'received',
                        registrationOptions: 'mock-registration-options'
                    })
                )
            );
            httpPostMock = (httpPost as jest.Mock).mockImplementation(
                jest.fn(() =>
                    Promise.resolve({
                        resultCode: 'RedirectShopper',
                        redirectResult: 'xxx'
                    })
                )
            );
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                onAdditionalDetails: onAdditionalDetailsMock,
                _isAdyenHosted: true,
                type: 'await',
                paymentMethodData: { enrollmentId: 'mock-enrollment-id' },
                clientKey: 'mock-client-key'
            });
            render(payByBankPixElement.render());
            await waitFor(() =>
                expect(httpPostMock).toHaveBeenCalledWith(
                    { loadingContext: 'test', path: 'utility/v1/pixpaybybank/redirect-result?clientKey=mock-client-key', timeout: 10000 },
                    { enrollmentId: 'mock-enrollment-id', fidoAssertion: 'mock-fidoAssertion' }
                )
            );
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();
            expect(onAdditionalDetailsMock).toHaveBeenCalledWith(
                { data: { details: { redirectResult: 'xxx' } } },
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('Payment flow', () => {
        let payByBankPixElement: PayByBankPix;
        const onChangeMock = jest.fn();
        const onSubmitMock = jest.fn();

        beforeEach(() => {
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                onChange: onChangeMock,
                onSubmit: onSubmitMock,
                _isAdyenHosted: true,
                storedPaymentMethodId: 'mock-stored-payment-method-id',
                payByBankPixDetails: {
                    receiver: 'mock-receiver',
                    ispb: 'mock-issuer',
                    deviceId: 'mock-device'
                },
                amount: { value: 100, currency: 'BRL' }
            });
        });

        test('isAvailable should resolve if canUseStoredCredential returns true', async () => {
            await expect(payByBankPixElement.isAvailable()).resolves.toBeUndefined();
            expect(canUseStoredCredentialMock).toHaveBeenCalled();
        });

        test('isAvailable should reject if canUseStoredCredential returns false', async () => {
            canUseStoredCredentialMock.mockResolvedValueOnce(false);
            await expect(payByBankPixElement.isAvailable()).rejects.toThrow(
                new AdyenCheckoutError('ERROR', 'The stored payment method is not available on this device')
            );
        });

        test('should send the storedPaymentMethodId when the pay button is clicked', async () => {
            render(payByBankPixElement.render());
            await user.click(screen.getByRole('button', { name: /Continue/i }));
            expect(onSubmitMock).toHaveBeenCalledWith(
                {
                    data: {
                        clientStateDataIndicator: true,
                        paymentMethod: {
                            checkoutAttemptId: 'fetch-checkoutAttemptId-failed',
                            storedPaymentMethodId: 'mock-stored-payment-method-id',
                            type: 'paybybank_pix',
                            deviceId: 'mock-device',
                            riskSignals: {
                                language: 'en-US',
                                osVersion: 'xxx',
                                screenDimensions: { height: 100, width: 100 },
                                userTimeZoneOffset: -60
                            }
                        }
                    },
                    isValid: true
                },
                expect.anything(),
                expect.anything()
            );
        });

        test('should render the Await for the await action', async () => {
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                onChange: onChangeMock,
                onSubmit: onSubmitMock,
                _isAdyenHosted: true,
                storedPaymentMethodId: 'mock-stored-payment-method-id',
                amount: { value: 100, currency: 'BRL' },
                type: 'await'
            });
            render(payByBankPixElement.render());
            expect(await screen.findByText('Fetching details...')).toBeInTheDocument();
        });

        test('should poll the correct endpoint during the Await process', async () => {
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                onChange: onChangeMock,
                onSubmit: onSubmitMock,
                _isAdyenHosted: true,
                storedPaymentMethodId: 'mock-stored-payment-method-id',
                paymentMethodData: { enrollmentId: 'mock-enrollment-id', initiationId: 'mock-initiationId-id' },
                clientKey: 'mock-client-key',
                type: 'await'
            });
            render(payByBankPixElement.render());
            await waitFor(() =>
                expect(httpGetMock).toHaveBeenCalledWith({
                    loadingContext: 'test',
                    path: 'utility/v1/pixpaybybank/authorization-options?initiationId=mock-initiationId-id&enrollmentId=mock-enrollment-id&clientKey=mock-client-key',
                    timeout: 10000
                })
            );
        });

        test('should call authenticateWithCredential of the passkeyService, and authorizePayment endpoint, when authenticationOptions is available', async () => {
            httpGetMock.mockReset();
            httpGetMock = (httpGet as jest.Mock).mockImplementation(
                jest.fn(() =>
                    Promise.resolve({
                        resultCode: 'received',
                        authorizationOptions: 'mock-authorization-options'
                    })
                )
            );
            payByBankPixElement = new PayByBankPix(global.core, {
                ...coreProps,
                modules: { ...coreProps.modules, srPanel: new SRPanel(global.core) },
                onChange: onChangeMock,
                onSubmit: onSubmitMock,
                _isAdyenHosted: true,
                storedPaymentMethodId: 'mock-stored-payment-method-id',
                paymentMethodData: { enrollmentId: 'mock-enrollment-id', initiationId: 'mock-initiationId-id' },
                clientKey: 'mock-client-key',
                type: 'await'
            });
            render(payByBankPixElement.render());
            await waitFor(() => expect(mockCreateCredential).toHaveBeenCalledWith('mock-authorization-options'));
            await waitFor(() =>
                expect(httpPostMock).toHaveBeenCalledWith(
                    { loadingContext: 'test', path: 'utility/v1/pixpaybybank/redirect-result?clientKey=mock-client-key', timeout: 10000 },
                    {
                        enrollmentId: 'mock-enrollment-id',
                        initiationId: 'mock-initiationId-id',
                        fidoAssertion: 'mock-fidoAssertion'
                    }
                )
            );
        });
    });
});
