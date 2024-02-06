import { mount } from 'enzyme';
import { AdyenCheckout } from '../../index';
import ThreeDS2DeviceFingerprint from '../ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from '../ThreeDS2/ThreeDS2Challenge';
import { screen, render } from '@testing-library/preact';
import Dropin from './Dropin';
import { ICore } from '../../core/types';

describe('Dropin', () => {
    let checkout: ICore;

    beforeEach(async () => {
        checkout = await AdyenCheckout({
            environment: 'test',
            clientKey: 'test_123456',
            analytics: { enabled: false },
            paymentMethodsResponse: {
                paymentMethods: [{ name: 'AliPay', type: 'alipay' }]
            },
            risk: {
                enabled: false
            }
        });
    });

    describe('isValid', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin({ core: checkout });
            expect(dropin.isValid).toEqual(false);
        });
    });

    describe('submit', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin({ core: checkout });
            expect(() => dropin.submit()).toThrow();
        });
    });

    describe('closeActivePaymentMethod', () => {
        test('should close active payment method', async () => {
            const dropin = new Dropin({ core: checkout });
            const component = await mount(dropin.render());
            await component.update();

            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();
            dropin.closeActivePaymentMethod();
            expect(dropin.dropinRef.state.activePaymentMethod).toBeNull();
        });
    });

    describe('handleAction() for "threeDS2" type', () => {
        test('should handle new fingerprint action', () => {
            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const dropin = new Dropin({ core: checkout });

            dropin.handleAction(fingerprintAction);
            expect(dropin.componentFromAction instanceof ThreeDS2DeviceFingerprint).toEqual(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2DeviceFingerprint).props.showSpinner).toEqual(false);
            expect(dropin.componentFromAction.props.statusType).toEqual('loading');
            expect(dropin.componentFromAction.props.isDropin).toBe(true);
        });

        test('should handle new challenge action', async () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2',
                paymentMethodType: 'scheme'
            };

            const dropin = new Dropin({ core: checkout });

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
                type: 'threeDS2',
                paymentMethodType: 'scheme'
            };

            const checkout = await AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false }
            });

            const dropin = new Dropin({
                core: checkout,
                paymentMethodsConfiguration: { card: { challengeWindowSize: '02' } }
            });
            jest.spyOn(dropin, 'activePaymentMethod', 'get').mockReturnValue({ props: { challengeWindowSize: '02' } });

            dropin.handleAction(challengeAction);
            expect(dropin.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2Challenge).props.challengeWindowSize).toEqual('02');
        });

        test('new challenge action gets challengeWindowSize from handleAction config', async () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                type: 'threeDS2',
                paymentMethodType: 'scheme'
            };

            const dropin = new Dropin({ core: checkout });

            dropin.handleAction(challengeAction, {
                challengeWindowSize: '03'
            });
            expect(dropin.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect((dropin.componentFromAction as unknown as ThreeDS2Challenge).props.challengeWindowSize).toEqual('03');
        });
    });

    describe('Instant Payments feature', () => {
        test('formatProps formats instantPaymentTypes removing duplicates and invalid values', async () => {
            const dropin = new Dropin({
                core: checkout,
                // @ts-ignore Valid test case
                instantPaymentTypes: ['paywithgoogle', 'paywithgoogle', 'paypal', 'alipay']
            });
            expect(dropin.props.instantPaymentTypes).toStrictEqual(['paywithgoogle']);
        });
    });

    describe('Payment status', () => {
        test('should show success status', async () => {
            const dropin = new Dropin({ core: checkout });
            render(dropin.render());
            expect(await screen.findByRole('radio')).toBeTruthy();
            dropin.setStatus('success');
            expect(await screen.findByText(/Payment Successful/i)).toBeTruthy();
        });

        test('should show Error status', async () => {
            const dropin = new Dropin({ core: checkout });
            render(dropin.render());
            expect(await screen.findByRole('radio')).toBeTruthy();
            dropin.setStatus('error');
            expect(await screen.findByText(/An unknown error occurred/i)).toBeTruthy();
        });
    });
});
