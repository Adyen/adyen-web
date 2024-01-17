import UIElement from './UIElement';
import { ICore } from '../../../core/types';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { AdyenCheckout, ThreeDS2Challenge, ThreeDS2DeviceFingerprint } from '../../../index';
import { UIElementProps } from './types';

interface MyElementProps extends UIElementProps {
    challengeWindowSize?: string;
}
class MyElement extends UIElement<MyElementProps> {
    public static type = 'super_pay';

    public get isValid(): boolean {
        return false;
    }
    public callOnComplete() {
        super.onComplete({});
    }
    public callOnChange() {
        super.onChange();
    }
    render() {
        return '';
    }
}

const submitMock = jest.fn();
(global as any).HTMLFormElement.prototype.submit = () => submitMock;

const core = mockDeep<ICore>();
beforeEach(() => {
    mockReset(core);
});

describe('UIElement', () => {
    describe('onComplete()', () => {
        test('should call "onComplete" prop if available', () => {
            const onCompleteCb = jest.fn();
            const element = new MyElement({ core: core, onComplete: onCompleteCb });

            element.callOnComplete();

            expect(onCompleteCb.mock.calls.length).toBe(1);
        });
    });

    describe('onChange()', () => {
        test('should call "onChange" prop if available', () => {
            const onChange = jest.fn();
            const element = new MyElement({ core: core, onChange });

            element.callOnChange();

            expect(onChange.mock.calls.length).toBe(1);
        });

        test('should not trigger onValid method if the component is not valid', () => {
            const onValid = jest.fn();
            const element = new MyElement({ core: core, onValid });

            element.callOnChange();

            expect(onValid.mock.calls.length).toBe(0);
        });

        test('should trigger the onValid method if the component is valid', () => {
            class MyValidElement extends UIElement {
                get isValid() {
                    return true;
                }
                onChange(): object {
                    return super.onChange();
                }
            }

            const onValid = jest.fn();
            const element = new MyValidElement({ core: core, onValid });
            element.onChange();

            expect(onValid.mock.calls.length).toBe(1);
        });
    });

    describe('isValid()', () => {
        test('should be false by default', () => {
            class PristineUiElement extends UIElement {}
            const element = new PristineUiElement({ core: core });
            expect(element.isValid).toBe(false);
        });
    });

    describe('showValidation()', () => {
        test("should trigger the component's showValidation method", () => {
            const showValidation = jest.fn();
            const element = new MyElement({ core: core });

            const componentRef = {
                showValidation
            };

            element.setComponentRef(componentRef);
            element.showValidation();

            expect(showValidation.mock.calls.length).toBe(1);
        });
    });

    describe('get displayName()', () => {
        test('should use the name property if available', () => {
            const element = new MyElement({ core: core, name: 'SuperPay' });
            expect(element.displayName).toEqual('SuperPay');
        });

        test('should use the constructor type if no name property is passed', () => {
            const element = new MyElement({ core: core });
            expect(element.displayName).toEqual('super_pay');
        });

        test('should use the name from payment methods response', () => {
            core.paymentMethodsResponse.paymentMethods = [
                {
                    name: 'SuperPayeee',
                    type: 'super_pay'
                }
            ];

            const element = new MyElement({ core: core });
            expect(element.displayName).toEqual('SuperPayeee');
        });

        test('should use the name prop as it has precedence over payment methods response name property', () => {
            core.paymentMethodsResponse.paymentMethods = [
                {
                    name: 'SuperPayeee',
                    type: 'super_pay'
                }
            ];

            const element = new MyElement({ core: core, name: 'SuperbPay' });
            expect(element.displayName).toEqual('SuperbPay');
        });
    });

    describe('handleAction()', () => {
        test('should handle fingerprint action', async () => {
            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                authorisationToken: 'BQABAQCmFNEdaCE3rcbbB...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OXdhSEF0TnpFdGMybHRiMjR1YzJWaGJXeGxjM010WTJobFkydHZkWFF1WTI5dC50VnJIV3B4UktWVTVPMENiNUg5TVFlUnJKdmZRQ1lnbXR6VTY1WFhzZ2NvIiwidGhyZWVEU01ldGhvZFVybCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL3N0YXJ0TWV0aG9kLnNodG1sIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI5MzI2ZjNiOS00MTc3LTQ4ZTktYmM2Mi1kOTliYzVkZDA2Y2IifQ==',
                type: 'threeDS2'
            };

            const checkout = await AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false }
            });

            const element = new MyElement({ core: checkout }).mount('body');

            const actionComponent = element.handleAction(fingerprintAction);
            expect(actionComponent instanceof ThreeDS2DeviceFingerprint).toEqual(true);

            expect(actionComponent.props.elementRef).not.toBeDefined();
            expect((actionComponent as unknown as ThreeDS2DeviceFingerprint).props.showSpinner).toEqual(true);
            expect(actionComponent.props.statusType).toEqual('loading');
            expect(actionComponent.props.isDropin).toBe(false);
        });

        test('should handle challenge action', async () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                authorisationToken: 'BQABAQCmFNEdaCE3rcbbB...',
                subtype: 'challenge',
                token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                paymentMethodType: 'scheme',
                type: 'threeDS2'
            };

            const checkout = await AdyenCheckout({
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false }
            });

            const element = new MyElement({ core: checkout, challengeWindowSize: '02' }).mount('body');

            const actionComponent = element.handleAction(challengeAction);
            expect(actionComponent instanceof ThreeDS2Challenge).toEqual(true);
            expect(actionComponent.props.elementRef).not.toBeDefined();
            expect(actionComponent.props.statusType).toEqual('custom');
            expect(actionComponent.props.isDropin).toBe(false);
            expect((actionComponent as unknown as ThreeDS2Challenge).props.challengeWindowSize).toEqual('02');
        });

        test('should throw Error if merchant passes the whole response object', async () => {
            const paymentResponse = {
                action: {
                    paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                    authorisationToken: 'BQABAQCmFNEdaCE3rcbbB...',
                    subtype: 'challenge',
                    token: 'eyJhY3NSZWZlcmVuY2VOdW1iZXIiOiJBRFlFTi1BQ1MtU0lNVUxBVE9SIiwiYWNzVHJhbnNJRCI6Ijg0MzZjYThkLThkN2EtNGFjYy05NmYyLTE0ZjU0MjgyNzczZiIsImFjc1VSTCI6Imh0dHBzOlwvXC9wYWwtdGVzdC5hZHllbi5jb21cL3RocmVlZHMyc2ltdWxhdG9yXC9hY3NcL2NoYWxsZW5nZS5zaHRtbCIsIm1lc3NhZ2VWZXJzaW9uIjoiMi4xLjAiLCJ0aHJlZURTTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC8zZG5vdGlmLnNodG1sP29yaWdpbktleT1wdWIudjIuODExNTY1ODcwNTcxMzk0MC5hSFIwY0hNNkx5OWphR1ZqYTI5MWRITm9iM0J3WlhJdGRHVnpkQzVoWkhsbGJpNWpiMjAuVGFKalVLN3VrUFdTUzJEX3l2ZDY4TFRLN2dRN2ozRXFOM05nS1JWQW84OCIsInRocmVlRFNTZXJ2ZXJUcmFuc0lEIjoiZTU0NDNjZTYtNTE3Mi00MmM1LThjY2MtYmRjMGE1MmNkZjViIn0=',
                    paymentMethodType: 'scheme',
                    type: 'threeDS2'
                },
                resultCode: 'IdentifyShopper'
            };

            const element = new MyElement({ core }).mount('body');

            expect(() => {
                // @ts-ignore tslint is not applicable here as merchant can potentially pass wrong object
                element.handleAction(paymentResponse);
            }).toThrow('have you passed in the whole response object by mistake?');
        });

        test('should throw Error if merchant passes an invalid action', async () => {
            const action = {
                paymentMethodType: 'scheme'
            };

            const element = new MyElement({ core }).mount('body');

            expect(() => {
                // @ts-ignore tslint is not applicable here as merchant can potentially pass wrong object
                element.handleAction(action);
            }).toThrow('the passed action object does not have a "type" property');
        });
    });

    describe('submit()', () => {
        test('should trigger showValidation() and not call makePaymentsCall() if component is not valid', () => {
            const showValidation = jest.fn();

            const element = new MyElement({ core: core });

            // @ts-ignore Checking that internal method is not reached
            const makePaymentsCallSpy = jest.spyOn(element, 'makePaymentsCall');

            const componentRef = {
                showValidation
            };
            element.setComponentRef(componentRef);

            element.submit();

            expect(showValidation).toBeCalledTimes(1);
            expect(makePaymentsCallSpy).not.toHaveBeenCalled();
        });

        // test.todo('should make successfull payment using advanced flow');
        // test.todo('should make successfull payment using sessions flow');
        // test.todo('should call onPaymentFailed if payment contains resultCode non-sucessfull result code');
        // test.todo('should call onPaymentFailed if payment is rejected');
        // test.todo('should call component.handleAction if payment is resolved with action');
    });

    // describe('Handling additional details', () => {
    //     test.todo('should make successfull payment using advanced flow');
    //     test.todo('should make successfull payment using sessions flow');
    //     test.todo('should call onPaymentFailed if payment contains resultCode non-sucessfull result code');
    //     test.todo('should call onPaymentFailed if payment is rejected');
    // });
});
