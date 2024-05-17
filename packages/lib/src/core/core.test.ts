import { mount } from 'enzyme';
import AdyenCheckout from './core';
import BCMCMobileElement from '../components/BcmcMobile';
import Session from './CheckoutSession';
import { Dropin, Ach } from '../components';
import { CheckoutSessionSetupResponse } from './CheckoutSession/types';

jest.mock('./Services/get-translations');

const sessionSetupResponseMock: CheckoutSessionSetupResponse = {
    id: 'session-id',
    sessionData: 'session-data',
    amount: {
        value: 1000,
        currency: 'USD'
    },
    expiresAt: '',
    paymentMethods: {
        paymentMethods: [],
        storedPaymentMethods: []
    },
    returnUrl: '',
    configuration: {},
    shopperLocale: 'en-US',
    countryCode: 'US'
};

jest.spyOn(Session.prototype, 'setupSession').mockImplementation(() => {
    return Promise.resolve(sessionSetupResponseMock);
});

describe('Core', () => {
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
                session: { id: 'session-id', sessionData: 'session-data', countryCode: 'US' }
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
            });

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
                token: 'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const actionComponent = checkout.createFromAction(fingerprintAction, { challengeWindowSize: '04' });

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
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2',
                paymentMethodType: 'scheme'
            };

            const actionComponent = checkout.createFromAction(challengeAction, { challengeWindowSize: '03' });

            expect(actionComponent.constructor['type']).toBe('threeDS2Challenge');
            expect(actionComponent.props.elementRef).not.toBeDefined();
            expect(actionComponent.props.showSpinner).not.toBeDefined();
            expect(actionComponent.props.statusType).toEqual('custom');
            expect(actionComponent.props.challengeWindowSize).toEqual('03');
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

            mount(dropin.render());
            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            const ach = dropin.dropinRef.state.elements[0];

            expect(ach.props.onAdditionalDetails).toBe(onAdditionalDetailsPaymentMethodConfig);
        });

        test('createFromAction - should use local property instead of global configuration property', async () => {
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
            paymentAction.onComplete({});
            expect(onAdditionalDetailsCreateFromAction).toHaveBeenCalledWith({}, expect.any(BCMCMobileElement));
        });
    });

    describe('update()', () => {
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
            const paymentMethodsResponse = { paymentMethods: [{ name: 'Credit Card', type: 'scheme', brands: ['visa'] }] };
            expect(checkout.paymentMethodsResponse).toHaveProperty('paymentMethods', []);
            await checkout.update({ paymentMethodsResponse });
            expect(checkout.paymentMethodsResponse).toHaveProperty('paymentMethods', paymentMethodsResponse.paymentMethods);
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

            expect(async () => await core.initialize()).rejects.toThrow('You must specify a countryCode');
        });

        test('SessionsFlow, without a countryCode, should throw an error', () => {
            delete sessionSetupResponseMock.countryCode;

            const checkout = new AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                session: { id: 'session-id', sessionData: 'session-data' }
            });

            expect(async () => await checkout.initialize()).rejects.toThrow('You must specify a countryCode');
        });
    });
});
