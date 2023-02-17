import { mount } from 'enzyme';
import AdyenCheckout from '../../index';
import ThreeDS2DeviceFingerprint from '../ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from '../ThreeDS2/ThreeDS2Challenge';
import DropinElement from './Dropin';

const submitMock = jest.fn();
(global as any).HTMLFormElement.prototype.submit = () => submitMock;

describe('Dropin', () => {
    let dropin: DropinElement;

    beforeEach(async () => {
        const checkout = await AdyenCheckout({ analytics: { enabled: false } });
        dropin = checkout.create('dropin');
    });

    describe('isValid', () => {
        test('should fail if no activePaymentMethod', () => {
            expect(dropin.isValid).toEqual(false);
        });
    });

    describe('submit', () => {
        test('should fail if no activePaymentMethod', () => {
            expect(() => dropin.submit()).toThrow();
        });
    });

    describe('closeActivePaymentMethod', () => {
        test('should close active payment method', async () => {
            const dp = await mount(dropin.render());
            await dp.update();

            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();
            dropin.closeActivePaymentMethod();
            expect(dropin.dropinRef.state.activePaymentMethod).toBeNull();
        });
    });

    describe('handleAction for new "threeDS2" type', () => {
        const challengeAction = {
            paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
            subtype: 'challenge',
            token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
            type: 'threeDS2',
            paymentMethodType: 'scheme'
        };

        test('should handle new fingerprint action', () => {
            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const pa = dropin.handleAction(fingerprintAction);
            expect(pa.componentFromAction instanceof ThreeDS2DeviceFingerprint).toEqual(true);
            expect(pa.componentFromAction.props.showSpinner).toEqual(false);
            expect(pa.componentFromAction.props.statusType).toEqual('loading');
            expect(pa.componentFromAction.props.isDropin).toBe(true);
        });

        test('should handle new challenge action', async () => {
            const checkout = await AdyenCheckout({ analytics: { enabled: false } });

            const dropin = checkout.create('dropin');

            const pa = dropin.handleAction(challengeAction);
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect(pa.componentFromAction.props.statusType).toEqual('custom');
            expect(pa.componentFromAction.props.isDropin).toBe(true);
            expect(pa.componentFromAction.props.size).toEqual('02');
        });

        test('new challenge action gets challengeWindowSize from paymentMethodsConfiguration', async () => {
            const checkout = await AdyenCheckout({ paymentMethodsConfiguration: { threeDS2: { challengeWindowSize: '02' } } });

            const dropin = checkout.create('dropin');

            const pa = dropin.handleAction(challengeAction);
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect(pa.componentFromAction.props.challengeWindowSize).toEqual('02');
        });

        test('new challenge action gets challengeWindowSize from handleAction config', async () => {
            const checkout = await AdyenCheckout({ analytics: { enabled: false }, challengeWindowSize: '04' });

            const dropin = checkout.create('dropin');
            mount(dropin.render());

            const pa = dropin.handleAction(challengeAction, {
                challengeWindowSize: '03'
            });
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);
            expect(pa.componentFromAction.props.challengeWindowSize).toEqual('03');
        });
    });

    describe('Instant Payments feature', () => {
        test('formatProps formats instantPaymentTypes removing duplicates and invalid values', async () => {
            const checkout = await AdyenCheckout({
                analytics: { enabled: false }
            });
            const dropin = checkout.create('dropin', { instantPaymentTypes: ['alipay', 'paywithgoogle', 'paywithgoogle', 'paypal'] });

            expect(dropin.props.instantPaymentTypes).toStrictEqual(['paywithgoogle']);
        });

        test('formatProps filter out instantPaymentMethods from paymentMethods list ', async () => {
            const checkout = await AdyenCheckout({
                analytics: { enabled: false },
                paymentMethodsResponse: {
                    paymentMethods: [
                        { name: 'Google Pay', type: 'paywithgoogle' },
                        { name: 'AliPay', type: 'alipay' }
                    ]
                }
            });
            const dropin = checkout.create('dropin', { instantPaymentTypes: ['paywithgoogle'] });

            expect(dropin.props.paymentMethods).toHaveLength(1);
            expect(dropin.props.paymentMethods[0]).toStrictEqual({ type: 'alipay', name: 'AliPay' });
            expect(dropin.props.instantPaymentMethods).toHaveLength(1);
            expect(dropin.props.instantPaymentMethods[0]).toStrictEqual({ name: 'Google Pay', type: 'paywithgoogle' });
        });

        test('formatProps does not change paymentMethods list if instantPaymentType is not provided', async () => {
            const paymentMethods = [
                { name: 'Google Pay', type: 'paywithgoogle' },
                { name: 'AliPay', type: 'alipay' }
            ];

            const checkout = await AdyenCheckout({
                analytics: { enabled: false },
                paymentMethodsResponse: {
                    paymentMethods
                }
            });
            const dropin = checkout.create('dropin');

            expect(dropin.props.paymentMethods).toStrictEqual(paymentMethods);
            expect(dropin.props.instantPaymentMethods).toHaveLength(0);
        });
    });
});
