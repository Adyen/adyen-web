import { render } from '@testing-library/preact';
import AdyenCheckout from './core';
import BCMCMobileElement from '../components/BcmcMobile';
import Session from './CheckoutSession';
import { Dropin, Ach } from '../components';
import { CheckoutSessionSetupResponse } from './CheckoutSession/types';
import ThreeDS2DeviceFingerprint from '../components/ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from '../components/ThreeDS2/ThreeDS2Challenge';
import Redirect from '../components/Redirect';
import { PaymentActionsType } from '../types/global-types';
import Analytics from './Analytics';

jest.mock('./Services/get-translations');
jest.mock('./CheckoutSession');

const sessionSetupResponseMock: CheckoutSessionSetupResponse = {
    id: 'session-id',
    sessionData: 'session-data',
    amount: {
        value: 1000,
        currency: 'USD'
    },
    expiresAt: '',
    paymentMethods: {
        paymentMethods: [{}],
        storedPaymentMethods: [{}]
    },
    returnUrl: '',
    configuration: {},
    shopperLocale: 'en-US',
    countryCode: 'US'
};

const setupSessionSpy = jest.spyOn(Session.prototype, 'setupSession').mockImplementation(() => {
    return Promise.resolve(sessionSetupResponseMock);
});

let analyticsSetupSpy;

describe('Core', () => {
    beforeEach(() => {
        analyticsSetupSpy = jest.spyOn(Analytics.prototype, 'setUp').mockResolvedValue();
    });

    afterEach(() => {
        analyticsSetupSpy.mockRestore();
    });

    describe('Setting locale', () => {
        test('should default locale to en-US', async () => {
            const checkout = new AdyenCheckout({ countryCode: 'US', environment: 'test', clientKey: 'test_123456' });
            await checkout.initialize();
            expect(checkout.options.locale).toBe('en-US');
            expect(checkout.modules.i18n.locale).toBe('en-US');
        });

        test('should set a custom locale', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                locale: 'es-ES'
            });
            await checkout.initialize();

            expect(checkout.options.locale).toBe('es-ES');
            expect(checkout.modules.i18n.locale).toBe('es-ES');
        });
    });

    describe('initialize', () => {
        test('should do the setup call with the correct session data for the session flow', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                session: { id: 'session-id', sessionData: 'session-data' }
            });

            await checkout.initialize();
            expect(setupSessionSpy).toHaveBeenCalledWith(expect.objectContaining({ session: { id: 'session-id', sessionData: 'session-data' } }));
        });

        test('should call analytics setUp when initialized', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456'
            });

            await checkout.initialize();

            expect(analyticsSetupSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    locale: 'en-US'
                })
            );
        });

        test('should call analytics setUp with sessionId when using sessions flow', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                session: { id: 'session-id', sessionData: 'session-data' }
            });

            // Mock the id getter on the session instance
            Object.defineProperty(checkout.session, 'id', {
                get: () => 'session-id',
                configurable: true
            });

            await checkout.initialize();

            expect(analyticsSetupSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    locale: 'en-US',
                    sessionId: 'session-id'
                })
            );
        });
    });

    describe('Creating modules', () => {
        test('should create the modules when initializing on Advanced Flow', async () => {
            const checkout = new AdyenCheckout({ countryCode: 'US', environment: 'test', clientKey: 'test_123456' });
            await checkout.initialize();
            expect(Object.keys(checkout.modules).length).toBe(5);
        });

        test('should create the modules when initializing on Sessions flow', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                session: { id: 'session-id', sessionData: 'session-data' }
            });

            await checkout.initialize();

            expect(Object.keys(checkout.modules).length).toBeGreaterThan(1);
        });
    });

    describe('createFromAction', () => {
        test('should create a component from an action object', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456'
            });
            await checkout.initialize();

            const paymentAction = checkout.createFromAction({
                method: 'GET',
                paymentMethodType: 'alipay',
                type: 'redirect',
                url: 'https://example.com'
            }) as Redirect;

            expect(paymentAction.constructor['type']).toBe('redirect');
            expect(paymentAction.props.url).toBe('https://example.com');
        });

        test('should handle threeDS2 subtype "fingerprint" action', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456'
            });
            await checkout.initialize();

            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'xxx',
                type: 'threeDS2' as PaymentActionsType
            };

            const actionComponent = checkout.createFromAction(fingerprintAction, { challengeWindowSize: '04' }) as ThreeDS2DeviceFingerprint;

            expect(actionComponent.constructor['type']).toBe('threeDS2Fingerprint');

            expect(actionComponent.props.elementRef).not.toBeDefined();
            expect(actionComponent.props.showSpinner).toEqual(true);
            expect(actionComponent.props.statusType).toEqual('loading');
            expect(actionComponent.props.challengeWindowSize).toEqual('04');
        });

        test('should handle threeDS2 subtype "challenge" action', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456'
            });
            await checkout.initialize();

            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'xxx',
                type: 'threeDS2' as PaymentActionsType,
                paymentMethodType: 'scheme'
            };

            const actionComponent = checkout.createFromAction(challengeAction, { challengeWindowSize: '03' }) as ThreeDS2Challenge;

            expect(actionComponent.constructor['type']).toBe('threeDS2Challenge');
            expect(actionComponent.props.elementRef).not.toBeDefined();
            expect(actionComponent.props.statusType).toEqual('custom');
            expect(actionComponent.props.challengeWindowSize).toEqual('03');
            // @ts-ignore showSpinner should be undefined for threeDS2Challenge
            expect(actionComponent.props.showSpinner).not.toBeDefined();
        });

        test('should call (global) onAdditionalDetails with correct params when the action object (= a UIElement) calls onComplete', async () => {
            const onAdditionalDetails = jest.fn().mockName('onAdditionalDetailsGlobal');
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                onAdditionalDetails
            });
            await checkout.initialize();

            AdyenCheckout.register(BCMCMobileElement);
            const paymentAction = checkout.createFromAction({
                paymentMethodType: 'bcmc_mobile_QR',
                qrCodeData: 'BEP://1bcmc-test.adyen.com/pal/bep$ZTHYT3DHKVXYJ3GHBQNNCX4M',
                type: 'qrCode',
                paymentData: 'test'
            });

            // @ts-ignore onComplete is not public method, although we call it here to test the callback (equates to UIElement.onComplete)
            paymentAction.onComplete({});

            expect(onAdditionalDetails).toHaveBeenCalledWith(
                {},
                expect.any(BCMCMobileElement),
                expect.objectContaining({
                    resolve: expect.any(Function),
                    reject: expect.any(Function)
                })
            );
        });
    });

    describe('Props order', () => {
        const onAdditionalDetailsGlobal = jest.fn().mockName('onAdditionalDetailsGlobal');
        const onAdditionalDetailsComponent = jest.fn().mockName('onAdditionalDetailsComponent');
        const onAdditionalDetailsPaymentMethodConfig = jest.fn().mockName('onAdditionalDetailsPaymentMethodConfig');
        const onAdditionalDetailsCreateFromAction = jest.fn().mockName('onSubmitMockComponent');

        test('should use Component property instead of the global one', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                onAdditionalDetails: onAdditionalDetailsGlobal
            });
            await checkout.initialize();

            // @ts-ignore it's just a test
            const comp = new Ach(checkout, {
                onAdditionalDetails: onAdditionalDetailsComponent
            });

            expect(comp.props.onAdditionalDetails).toBe(onAdditionalDetailsComponent);
        });

        test('should use global property as the Component property is omitted', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                onAdditionalDetails: onAdditionalDetailsGlobal
            });
            await checkout.initialize();

            const comp = new Ach(checkout);

            expect(comp.props.onAdditionalDetails).toBe(onAdditionalDetailsGlobal);
        });

        test('should use prop from "paymentMethodsConfiguration" instead of global and local Component properties', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                analytics: { enabled: false },
                clientKey: 'test_123456',
                paymentMethodsResponse: {
                    paymentMethods: [
                        {
                            name: 'ACH Direct Debit',
                            type: 'ach'
                        }
                    ]
                },
                onAdditionalDetails: onAdditionalDetailsGlobal
            });

            await checkout.initialize();

            const dropin = new Dropin(checkout, {
                onAdditionalDetails: onAdditionalDetailsComponent,
                paymentMethodComponents: [Ach],
                paymentMethodsConfiguration: {
                    ach: {
                        onAdditionalDetails: onAdditionalDetailsPaymentMethodConfig
                    }
                }
            });

            render(dropin.render());
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            const ach = dropin.dropinRef.state.elements[0];

            expect(ach.props.onAdditionalDetails).toBe(onAdditionalDetailsPaymentMethodConfig);
        });

        test('createFromAction - should use local onAdditionalDetails property instead of global configuration property', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                onAdditionalDetails: onAdditionalDetailsGlobal
            });
            await checkout.initialize();

            AdyenCheckout.register(BCMCMobileElement);
            const paymentAction = checkout.createFromAction(
                {
                    paymentMethodType: 'bcmc_mobile_QR',
                    qrCodeData: 'BEP://1bcmc-test.adyen.com/pal/bep$ZTHYT3DHKVXYJ3GHBQNNCX4M',
                    type: 'qrCode',
                    paymentData: 'test'
                },
                { onAdditionalDetails: onAdditionalDetailsCreateFromAction }
            );

            expect(paymentAction.props.onAdditionalDetails).toBe(onAdditionalDetailsCreateFromAction);

            // @ts-ignore onComplete is not public method, although we call it here to test the callback
            paymentAction.onComplete({});

            expect(onAdditionalDetailsCreateFromAction).toHaveBeenCalledWith(
                {},
                expect.any(BCMCMobileElement),
                expect.objectContaining({
                    resolve: expect.any(Function),
                    reject: expect.any(Function)
                })
            );

            expect(onAdditionalDetailsGlobal).not.toHaveBeenCalled();
        });
    });

    describe('update()', () => {
        describe('Amount update', () => {
            test('should update the amount for multiple components', async () => {
                const initialAmount = { currency: 'USD', value: 5000 };

                const checkout = new AdyenCheckout({
                    amount: initialAmount,
                    countryCode: 'US',
                    environment: 'test',
                    clientKey: 'test_123456',
                    analytics: { enabled: false }
                });
                await checkout.initialize();

                const component1 = new Redirect(checkout);
                const component2 = new Redirect(checkout);

                expect(checkout.options.amount).toEqual(initialAmount);
                expect(component1.props.amount).toEqual(initialAmount);
                expect(component2.props.amount).toEqual(initialAmount);

                const spy1 = jest.spyOn(component1, 'updateAmount');
                const spy2 = jest.spyOn(component2, 'updateAmount');

                const newAmount = { currency: 'EUR', value: 1000 };

                await checkout.update({ amount: newAmount }, { shouldReinitializeCheckout: false });

                expect(spy1).toHaveBeenCalledWith(newAmount, undefined);
                expect(spy2).toHaveBeenCalledWith(newAmount, undefined);

                expect(checkout.options.amount).toEqual(newAmount);
                expect(component1.props.amount).toEqual(newAmount);
                expect(component2.props.amount).toEqual(newAmount);
            });

            test('should not update the amount if it is invalid', async () => {
                console.warn = jest.fn();

                const initialAmount = { currency: 'USD', value: 5000 };
                const checkout = new AdyenCheckout({
                    amount: initialAmount,
                    countryCode: 'US',
                    environment: 'test',
                    clientKey: 'test_123456',
                    analytics: { enabled: false }
                });
                await checkout.initialize();

                const component = new Redirect(checkout);
                const spy = jest.spyOn(component, 'updateAmount');

                const newAmount = { currency: '', value: 100 };

                await checkout.update({ amount: newAmount }, { shouldReinitializeCheckout: false });

                expect(spy).not.toHaveBeenCalled();

                expect(checkout.options.amount).toEqual(initialAmount);
                expect(component.props.amount).toEqual(initialAmount);

                expect(console.warn).toHaveBeenCalledWith('Core update(): Update canceled. Invalid amount object');
            });

            test('should not update the secondary amount if it is invalid', async () => {
                console.warn = jest.fn();

                const initialAmount = { currency: 'USD', value: 5000 };
                const checkout = new AdyenCheckout({
                    amount: initialAmount,
                    countryCode: 'US',
                    environment: 'test',
                    clientKey: 'test_123456',
                    analytics: { enabled: false }
                });
                await checkout.initialize();

                const component = new Redirect(checkout);
                const spy = jest.spyOn(component, 'updateAmount');

                const newAmount = { currency: 'USD', value: 100 };
                const secondaryAmount = { currency: '', value: 100 };

                await checkout.update({ amount: newAmount, secondaryAmount }, { shouldReinitializeCheckout: false });

                expect(spy).not.toHaveBeenCalled();

                expect(checkout.options.secondaryAmount).toBeUndefined();
                expect(component.props.secondaryAmount).toBeUndefined();

                expect(console.warn).toHaveBeenCalledWith('Core update(): Update canceled. Invalid secondary amount object');
            });
        });

        test('should update all components under main instance', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false }
            });
            await checkout.initialize();

            const component = new Dropin(checkout).mount('body');
            const spy = jest.spyOn(component, 'update');

            await checkout.update();

            expect(spy).toHaveBeenCalled();
        });

        test('should update the payment method list for the advanced flow', async () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'xxxx'
            });
            await checkout.initialize();

            expect(checkout.paymentMethodsResponse).toHaveProperty('paymentMethods', []);

            const paymentMethodsResponse = { paymentMethods: [{ name: 'Credit Card', type: 'scheme', brands: ['visa'] }] };

            await checkout.update({ paymentMethodsResponse });

            expect(checkout.paymentMethodsResponse.paymentMethods).toMatchObject([
                { name: 'Credit Card', type: 'scheme', brands: ['visa'], _id: expect.any(String) }
            ]);
        });
    });

    describe('Customizing URLs (PBL use-case)', () => {
        test('should use custom checkoutshopper URL url if available', () => {
            const checkout = new AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                _environmentUrls: {
                    api: 'https://localhost:8080/checkoutshopper/'
                },
                clientKey: 'devl_FX923810'
            });

            expect(checkout.loadingContext).toBe('https://localhost:8080/checkoutshopper/');
        });
    });

    describe('Initialising without a countryCode', () => {
        test('AdvancedFlow, without a countryCode, should throw an error', () => {
            const core = new AdyenCheckout({
                environment: 'test',
                _environmentUrls: {
                    api: 'https://localhost:8080/checkoutshopper/'
                },
                clientKey: 'devl_FX923810'
            });

            void expect(async () => await core.initialize()).rejects.toThrow('You must specify a countryCode');
        });

        test('SessionsFlow, without a countryCode, should throw an error', () => {
            delete sessionSetupResponseMock.countryCode;

            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                session: { id: 'session-id', sessionData: 'session-data' }
            });

            void expect(async () => await checkout.initialize()).rejects.toThrow('You must specify a countryCode');
        });
    });

    describe('submitDetails', () => {
        const details = { details: { redirectResult: 'dummy-redirect-result' } };
        const mockOnPaymentCompleted = jest.fn();
        const mockOnError = jest.fn();
        const mockAfterAdditionalDetails = jest.fn();

        test('calls onPaymentCompleted for the successful payment', async () => {
            const submitDetailsRes = { resultCode: 'Authorised', sessionData: 'dummySessionData' };
            // @ts-ignore: testing purpose
            jest.spyOn(Session.prototype, 'submitDetails').mockImplementation(() => {
                return Promise.resolve(submitDetailsRes);
            });

            const core = new AdyenCheckout({
                countryCode: 'US',
                clientKey: 'test_CLIENT_KEY',
                session: { id: 'session-id' },
                environment: 'test',
                exposeLibraryMetadata: false,
                onPaymentCompleted: mockOnPaymentCompleted,
                onError: mockOnError
            });
            await core.initialize();
            core.submitDetails(details);
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();
            expect(mockOnPaymentCompleted).toHaveBeenCalledWith(submitDetailsRes);
        });

        test('calls afterAdditionalDetails if there is an action from the response that needs to be exposed', async () => {
            const submitDetailsRes = {
                resultCode: 'RedirectShopper',
                sessionData: 'dummySessionData',
                action: {
                    paymentData: 'mockPaymentData',
                    paymentMethodType: 'paybybank_pix',
                    type: 'redirect'
                }
            };
            // @ts-ignore test purpose
            jest.spyOn(Session.prototype, 'submitDetails').mockImplementation(() => {
                return Promise.resolve(submitDetailsRes);
            });

            const core = new AdyenCheckout({
                countryCode: 'US',
                clientKey: 'test_CLIENT_KEY',
                session: { id: 'session-id' },
                environment: 'test',
                exposeLibraryMetadata: false,
                onPaymentCompleted: mockOnPaymentCompleted,
                onError: mockOnError,
                afterAdditionalDetails: mockAfterAdditionalDetails
            });

            await core.initialize();
            core.modules = global.commonCoreProps.modules;
            core.submitDetails(details);

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            expect(mockAfterAdditionalDetails).toHaveBeenCalled();
        });
    });
});
