import UIElement from './UIElement';
import Core from '../core';
import ThreeDS2DeviceFingerprint from './ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from './ThreeDS2/ThreeDS2Challenge';

const submitMock = jest.fn();
(global as any).HTMLFormElement.prototype.submit = () => submitMock;

describe('UIElement', () => {
    describe('onComplete', () => {
        test('calls the passed onComplete function', () => {
            const onComplete = jest.fn();
            const uiElement = new UIElement({ onComplete });
            uiElement.onComplete({});
            expect(onComplete.mock.calls.length).toBe(1);
        });
    });

    describe('onChange', () => {
        test('calls the passed onChange function', () => {
            const onChange = jest.fn();
            const uiElement = new UIElement({ onChange });
            uiElement.onChange();
            expect(onChange.mock.calls.length).toBe(1);
        });

        test('does not trigger the onValid method if the component is not valid', () => {
            const onValid = jest.fn();
            const uiElement = new UIElement({ onValid });
            uiElement.onChange();
            expect(onValid.mock.calls.length).toBe(0);
        });

        test('triggers the onValid method if the component is valid', () => {
            const onValid = jest.fn();
            class MyElement extends UIElement {
                get isValid() {
                    return true;
                }
            }

            const myElement = new MyElement({ onValid });
            myElement.onChange();
            expect(onValid.mock.calls.length).toBe(1);
        });
    });

    describe('isValid', () => {
        test('should be false by default', () => {
            const uiElement = new UIElement({});
            expect(uiElement.isValid).toBe(false);
        });
    });

    describe('onValid', () => {
        test('calls the passed onValid function', () => {
            const onValid = jest.fn((state, element) => {});
            const uiElement = new UIElement({ onValid });
            uiElement.onValid();
            expect(onValid.mock.calls.length).toBe(1);
        });
    });

    describe('showValidation', () => {
        test("calls component's showValidation method", () => {
            const showValidation = jest.fn();
            class MyElement extends UIElement {
                showValidation = () => showValidation();
            }

            const myElement = new MyElement({});
            myElement.showValidation();
            expect(showValidation.mock.calls.length).toBe(1);
        });
    });

    describe('get displayName', () => {
        test('returns the name prop', () => {
            const uiElement = new UIElement({ name: 'test123' });
            expect(uiElement.displayName).toEqual('test123');
        });

        test('returns the constructor type if no name prop is passed', () => {
            class MyElement extends UIElement {
                static type = 'test123';
            }

            const myElement = new MyElement({});
            expect(myElement.displayName).toEqual('test123');
        });
    });

    describe('handleAction', () => {
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

            const checkout = new Core({ challengeWindowSize: '04' });

            const comp = checkout.create('card', { challengeWindowSize: '03' }).mount('body');

            const pa = comp.handleAction(fingerprintAction);
            expect(pa instanceof ThreeDS2DeviceFingerprint).toEqual(true);

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.showSpinner).toEqual(true);
            expect(pa.props.statusType).toEqual('loading');
            expect(pa.props.isDropin).toBe(false);

            expect(pa.props.challengeWindowSize).toEqual('03');
        });

        test('should handle new challenge action', () => {
            const checkout = new Core({ challengeWindowSize: '02' });

            const comp = checkout.create('card', { challengeWindowSize: '03' }).mount('body');

            const pa = comp.handleAction(challengeAction);
            expect(pa instanceof ThreeDS2Challenge).toEqual(true);

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.statusType).toEqual('custom');
            expect(pa.props.isDropin).toBe(false);

            expect(pa.props.challengeWindowSize).toEqual('03');
        });

        test('new challenge action gets challengeWindowSize from checkout config', () => {
            const checkout = new Core({ challengeWindowSize: '02' });

            const comp = checkout.create('card', {}).mount('body');

            const pa = comp.handleAction(challengeAction);
            expect(pa instanceof ThreeDS2Challenge).toEqual(true);

            expect(pa.props.elementRef).not.toBeDefined();
            expect(pa.props.statusType).toEqual('custom');
            expect(pa.props.isDropin).toBe(false);

            expect(pa.props.challengeWindowSize).toEqual('02');
        });
    });
});
