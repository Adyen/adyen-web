import { screen, render, fireEvent, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { AdyenCheckout } from '../../index';
import ThreeDS2DeviceFingerprint from '../ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from '../ThreeDS2/ThreeDS2Challenge';
import Dropin from './Dropin';
import Fastlane from '../PayPalFastlane';
import enUS from '../../../../server/translations/en-US.json';
import getTranslations from '../../core/Services/get-translations';
import { SRPanel } from '../../core/Errors/SRPanel';
import { ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';

import type { CoreConfiguration, ICore } from '../../core/types';
import type { PaymentActionsType } from '../../types/global-types';

jest.mock('../../core/Services/get-translations');
const mockedGetTranslations = getTranslations as jest.Mock;
mockedGetTranslations.mockResolvedValue(enUS);

async function createAdyenCheckout(configuration) {
    return await AdyenCheckout(configuration);
}

function getAdyenCheckoutConfiguration(config?): CoreConfiguration {
    return {
        amount: {
            value: 2999,
            currency: 'USD'
        },
        countryCode: 'US',
        environment: 'test',
        clientKey: 'test_123456',
        analytics: { enabled: false },
        paymentMethodsResponse: {
            paymentMethods: [
                { name: 'AliPay', type: 'alipay' },
                { name: 'KakaoPay', type: 'kakaopay' },
                { name: 'Paytm', type: 'paytm' }
            ]
        },
        risk: {
            enabled: false
        },
        ...config
    };
}

describe('Dropin', () => {
    let checkout: ICore;
    let configObj: any;

    beforeEach(async () => {
        configObj = getAdyenCheckoutConfiguration();
        checkout = await AdyenCheckout(configObj);
    });

    describe('Configuration "disableFinalAnimation"', () => {
        test('should not set the Dropin status if disableFinalAnimation is set to true', () => {
            const dropin = new Dropin(checkout, { disableFinalAnimation: true });
            const setStatusMock = jest.fn();
            dropin.dropinRef = {
                setStatus: setStatusMock
            };
            dropin.displayFinalAnimation('success');

            expect(dropin.props.disableFinalAnimation).toBeTruthy();
            expect(setStatusMock).toHaveBeenCalledTimes(0);
        });

        test('should set the Dropin final status if configuration is not provided', () => {
            const dropin = new Dropin(checkout);
            const setStatusMock = jest.fn();
            dropin.dropinRef = {
                setStatus: setStatusMock
            };
            dropin.displayFinalAnimation('success');

            expect(dropin.props.disableFinalAnimation).toBeFalsy();
            expect(setStatusMock).toHaveBeenCalledWith('success');
            expect(setStatusMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('isValid', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin(checkout);
            expect(dropin.isValid).toEqual(false);
        });
    });

    describe('submit', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin(checkout);
            expect(() => dropin.submit()).toThrow();
        });
    });

    // TODO - FIX: this test doesn't do anything
    // describe('closeActivePaymentMethod', () => {
    //     test('should close active payment method', async () => {
    //         const dropin = new Dropin(checkout);
    //         const component = await mount(dropin.render());
    //         await component.update();
    //
    //         // re. TODO: dropin.dropinRef.state.activePaymentMethod = null, which is defined, so this assertion passes
    //         expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();
    //         dropin.closeActivePaymentMethod();
    //         expect(dropin.dropinRef.state.activePaymentMethod).toBeNull();
    //     });
    // });

    describe('handleAction() for "threeDS2" type', () => {
        test('should handle new fingerprint action', () => {
            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2' as PaymentActionsType
            };

            const dropin = new Dropin(checkout);

            dropin.handleAction(fingerprintAction);
            expect(dropin.componentFromAction instanceof ThreeDS2DeviceFingerprint).toEqual(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2DeviceFingerprint).props.showSpinner).toEqual(false);
            expect(dropin.componentFromAction.props.statusType).toEqual('loading');
            expect(dropin.componentFromAction.props.isDropin).toBe(true);
        });

        test('should handle new challenge action', () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2' as PaymentActionsType,
                paymentMethodType: 'scheme'
            };

            const dropin = new Dropin(checkout);

            dropin.handleAction(challengeAction);
            expect(dropin.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect(dropin.componentFromAction.props.statusType).toEqual('custom');
            expect(dropin.componentFromAction.props.isDropin).toBe(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2Challenge).props.size).toEqual('02');
        });

        test('new challenge action gets challengeWindowSize from paymentMethodsConfiguration', async () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2' as PaymentActionsType,
                paymentMethodType: 'scheme'
            };

            const checkout = await AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false }
            });

            const dropin = new Dropin(checkout, { paymentMethodsConfiguration: { card: { challengeWindowSize: '02' } } });
            jest.spyOn(dropin, 'activePaymentMethod', 'get').mockReturnValue({ props: { challengeWindowSize: '02' } });

            dropin.handleAction(challengeAction);
            expect(dropin.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2Challenge).props.challengeWindowSize).toEqual('02');
        });

        test('new challenge action gets challengeWindowSize from handleAction config', () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2' as PaymentActionsType,
                paymentMethodType: 'scheme'
            };

            const dropin = new Dropin(checkout);

            dropin.handleAction(challengeAction, {
                challengeWindowSize: '03'
            });
            expect(dropin.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2Challenge).props.challengeWindowSize).toEqual('03');
        });
    });

    describe('Instant Payments feature', () => {
        test('formatProps formats instantPaymentTypes removing duplicates and invalid values', () => {
            // @ts-ignore Testing invalid interface
            const dropin = new Dropin(checkout, { instantPaymentTypes: ['paywithgoogle', 'paywithgoogle', 'paypal', 'alipay'] });
            expect(dropin.props.instantPaymentTypes).toStrictEqual(['paywithgoogle']);
        });
    });

    describe('Payment status', () => {
        test('should show success status', async () => {
            const dropin = new Dropin(checkout);
            render(dropin.render());
            expect(await screen.findAllByRole('radio')).toBeTruthy();
            dropin.setStatus('success');
            expect(await screen.findByText(/Payment Successful/i)).toBeTruthy();
        });

        test('should show Error status', async () => {
            const dropin = new Dropin(checkout);
            render(dropin.render());
            expect(await screen.findAllByRole('radio')).toBeTruthy();
            dropin.setStatus('error');
            expect(await screen.findByText(/An unknown error occurred/i)).toBeTruthy();
        });
    });

    describe('Complying with local regulations', () => {
        test('Default values for openFirstPaymentMethod & openFirstStoredPaymentMethod are true', () => {
            const dropin = new Dropin(checkout);

            expect(dropin.props.openFirstPaymentMethod).toBe(true);
            expect(dropin.props.openFirstStoredPaymentMethod).toBe(true);
        });

        test('when countryCode is Finland openFirstPaymentMethod & openFirstStoredPaymentMethod should be false by default', () => {
            checkout.options.countryCode = 'FI';

            const dropin = new Dropin(checkout);

            expect(dropin.props.openFirstPaymentMethod).toBe(false);
            expect(dropin.props.openFirstStoredPaymentMethod).toBe(false);
        });

        test('if openFirstPaymentMethod & openFirstStoredPaymentMethod are set by merchant then these values should be used', () => {
            checkout.options.countryCode = 'FI';

            const dropin = new Dropin(checkout, { openFirstPaymentMethod: true, openFirstStoredPaymentMethod: true });

            expect(dropin.props.openFirstPaymentMethod).toBe(true);
            expect(dropin.props.openFirstStoredPaymentMethod).toBe(true);
        });
    });

    describe('Open specific payment method', () => {
        test('should open specific payment method if configured', async () => {
            const dropin = new Dropin(checkout, { openPaymentMethod: { type: 'paytm' } });
            render(dropin.render());

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.getByRole('button', { name: 'Continue to Paytm' })).toBeVisible());
        });

        test('should open the first payment method by default', async () => {
            const dropin = new Dropin(checkout);
            render(dropin.render());

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.getByRole('button', { name: 'Continue to AliPay' })).toBeVisible());
        });

        test('should not open any payment method if configured', async () => {
            const dropin = new Dropin(checkout, { openFirstPaymentMethod: false, openFirstStoredPaymentMethod: false });
            render(dropin.render());

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument());
        });
    });

    describe('Analytics', () => {
        test('should send the analytic config data after the payment method data is ready', async () => {
            const srPanel = mock<SRPanel>();
            srPanel.props.moveFocus = false;
            const mockSendAnalytics = jest.fn();
            global.analytics.sendAnalytics = mockSendAnalytics;
            const mockOnCreateElements = jest.fn().mockImplementation(() => {
                return [[Promise.resolve('Stored Element 1')], [Promise.resolve('Element 1')], [Promise.resolve('Instant Payment 1')]];
            });

            const dropin = new Dropin(checkout, {
                // @ts-ignore test only
                onCreateElements: mockOnCreateElements,
                modules: { srPanel, analytics: global.analytics, resources: global.resources }
            });
            render(dropin.render());
            await new Promise(process.nextTick);
            expect(mockSendAnalytics).toHaveBeenCalledWith('dropin', {
                type: ANALYTICS_RENDERED_STR,
                configData: dropin.dropinRef.analyticConfigData
            });

            jest.restoreAllMocks();
        });
    });

    describe('Dropin with Fastlane', () => {
        test('should render Fastlane if available and configured and should hide other payment methods', async () => {
            const config = getAdyenCheckoutConfiguration({
                paymentMethodsResponse: {
                    paymentMethods: [
                        { name: 'AliPay', type: 'alipay' },
                        { name: 'KakaoPay', type: 'kakaopay' },
                        { name: 'Fastlane', type: 'fastlane', brands: ['visa'] }
                    ]
                }
            });
            const checkout = await createAdyenCheckout(config);

            const dropin = new Dropin(checkout, {
                paymentMethodComponents: [Fastlane],
                paymentMethodsConfiguration: {
                    fastlane: {
                        tokenId: 'xxx',
                        lastFour: '1111',
                        brand: 'visa',
                        email: 'email@adyen.com',
                        fastlaneSessionId: 'session-id'
                    }
                }
            });
            render(dropin.render());

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.getByRole('button', { name: /Pay \$29.99/i })).toBeVisible());

            expect(screen.queryByText('AliPay')).not.toBeInTheDocument();
            expect(screen.queryByText('KakaoPay')).not.toBeInTheDocument();
            expect(screen.queryByTestId('payment-method-fastlane')).toBeVisible();
            expect(screen.queryByRole('button', { name: /Other payment methods/i })).toBeVisible();
        });

        test('should not return Fastlane if available and but not configured', async () => {
            const config = getAdyenCheckoutConfiguration({
                paymentMethodsResponse: {
                    paymentMethods: [
                        { name: 'AliPay', type: 'alipay' },
                        { name: 'KakaoPay', type: 'kakaopay' },
                        { name: 'Fastlane', type: 'fastlane', brands: ['visa'] }
                    ]
                }
            });
            const checkout = await createAdyenCheckout(config);

            const dropin = new Dropin(checkout, {
                paymentMethodComponents: [Fastlane]
            });
            render(dropin.render());

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.getByRole('button', { name: /Continue to AliPay/i })).toBeVisible());

            expect(screen.getByText('KakaoPay')).toBeVisible();
            expect(screen.queryByTestId('payment-method-fastlane')).toBeNull();
            expect(screen.queryByRole('button', { name: /Other payment methods/i })).toBeNull();
        });

        test('should remove Fastlane and display remaining payment methods once "Other payment methods" button is clicked', async () => {
            const config = getAdyenCheckoutConfiguration({
                paymentMethodsResponse: {
                    paymentMethods: [
                        { name: 'AliPay', type: 'alipay' },
                        { name: 'KakaoPay', type: 'kakaopay' },
                        { name: 'Fastlane', type: 'fastlane', brands: ['visa'] }
                    ]
                }
            });
            const checkout = await createAdyenCheckout(config);
            const user = userEvent.setup();

            const dropin = new Dropin(checkout, {
                paymentMethodComponents: [Fastlane],
                paymentMethodsConfiguration: {
                    fastlane: {
                        tokenId: 'xxx',
                        lastFour: '1111',
                        brand: 'visa',
                        email: 'email@adyen.com',
                        fastlaneSessionId: 'session-id'
                    }
                }
            });
            render(dropin.render());

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.getByRole('button', { name: /Pay \$29.99/i })).toBeVisible());
            expect(screen.queryByTestId('payment-method-fastlane')).toBeVisible();
            expect(screen.queryByText('AliPay')).not.toBeInTheDocument();
            expect(screen.queryByText('KakaoPay')).not.toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: /Other payment methods/i }));

            expect(screen.queryByText('AliPay')).toBeVisible();
            expect(screen.queryByText('KakaoPay')).toBeVisible();
            expect(screen.queryByTestId('payment-method-fastlane')).toBeNull();
            expect(screen.queryByRole('button', { name: /Other payment methods/i })).toBeNull();
        });
    });

    describe('Detecting Enter key presses', () => {
        test('should see merchant defined onEnterKeyPressed callback fired', async () => {
            const onEnterKeyPressedMock = jest.fn();
            const config = getAdyenCheckoutConfiguration({
                onEnterKeyPressed: onEnterKeyPressedMock
            });
            const checkout = await createAdyenCheckout(config);

            render(new Dropin(checkout).mount('body'));

            const flushPromises = () => new Promise(process.nextTick);
            await flushPromises();

            await waitFor(() => expect(screen.getByRole('button', { name: 'Continue to AliPay' })).toBeVisible());

            const alipayHeader = screen.getByText('AliPay');
            fireEvent.keyPress(alipayHeader, { key: 'Enter', code: 'Enter', charCode: 13 });

            expect(onEnterKeyPressedMock).toHaveBeenCalledTimes(1);
        });
    });
});
