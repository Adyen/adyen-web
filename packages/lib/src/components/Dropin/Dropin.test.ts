import { mount } from 'enzyme';
import Dropin from './Dropin';
import Core from '../../core';
import ThreeDS2DeviceFingerprint from '../ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from '../ThreeDS2/ThreeDS2Challenge';

const submitMock = jest.fn();
(global as any).HTMLFormElement.prototype.submit = () => submitMock;

describe('Dropin', () => {
    describe('isValid', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin({});
            mount(dropin.render());

            expect(dropin.isValid).toEqual(false);
        });

        test('should return the isValid value of the activePaymentMethod', () => {
            const dropin = new Dropin({});
            mount(dropin.render());
            dropin.dropinRef.state.activePaymentMethod = { isValid: true };
            expect(dropin.isValid).toEqual(true);
        });
    });

    describe('submit', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin({});
            expect(() => dropin.submit()).toThrow();
        });
    });

    describe('closeActivePaymentMethod', () => {
        test('should close active payment method', () => {
            const dropin = new Dropin({});
            mount(dropin.render());
            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();

            dropin.closeActivePaymentMethod();
            expect(dropin.dropinRef.state.activePaymentMethod).toBeNull();
        });
    });

    describe('handleAction for new "threeDS2" type', () => {
        const challengeAction = {
            paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
            subtype: 'challenge',
            token:
                'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
            type: 'threeDS2',
            paymentMethodType: 'scheme'
        };

        test('should handle new fingerprint action', () => {
            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token:
                    'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const checkout = new Core({});

            const dropin = new Dropin({ createFromAction: checkout.createFromAction });
            mount(dropin.render());

            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();

            const pa = dropin.handleAction(fingerprintAction);
            expect(pa.componentFromAction instanceof ThreeDS2DeviceFingerprint).toEqual(true);

            expect(pa.componentFromAction.props.elementRef).toBeDefined();
            expect(pa.componentFromAction.props.showSpinner).toEqual(false);
            expect(pa.componentFromAction.props.statusType).toEqual('loading');
            expect(pa.componentFromAction.props.isDropin).toBe(true);
        });

        test('should handle new challenge action', () => {
            const checkout = new Core({});

            const dropin = new Dropin({ createFromAction: checkout.createFromAction });
            mount(dropin.render());

            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();

            const pa = dropin.handleAction(challengeAction);
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);

            expect(pa.componentFromAction.props.elementRef).not.toBeDefined();
            expect(pa.componentFromAction.props.statusType).toEqual('custom');
            expect(pa.componentFromAction.props.isDropin).toBe(true);

            expect(pa.componentFromAction.props.size).toEqual('05');
        });

        test('new challenge action gets challengeWindowSize from pmConfig', () => {
            const checkout = new Core({ challengeWindowSize: '04' });

            const dropin = new Dropin({
                createFromAction: checkout.createFromAction,
                challengeWindowSize: '03',
                paymentMethodsConfiguration: { card: { challengeWindowSize: '02' } }
            });
            mount(dropin.render());

            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();

            const pa = dropin.handleAction(challengeAction);
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);

            expect(pa.componentFromAction.props.challengeWindowSize).toEqual('02');
        });

        test('new challenge action gets challengeWindowSize from component config', () => {
            const checkout = new Core({ challengeWindowSize: '04' });

            const dropin = new Dropin({
                createFromAction: checkout.createFromAction,
                challengeWindowSize: '03'
            });
            mount(dropin.render());

            const pa = dropin.handleAction(challengeAction);
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);

            expect(pa.componentFromAction.props.challengeWindowSize).toEqual('03');
        });

        test('new challenge action gets challengeWindowSize from checkout config', () => {
            const checkout = new Core({ challengeWindowSize: '04' });

            const dropin = new Dropin({
                createFromAction: checkout.createFromAction
            });
            mount(dropin.render());

            const pa = dropin.handleAction(challengeAction);
            expect(pa.componentFromAction instanceof ThreeDS2Challenge).toEqual(true);

            expect(pa.componentFromAction.props.challengeWindowSize).toEqual('04');
        });
    });
});
