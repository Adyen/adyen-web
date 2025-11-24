import { h } from 'preact';
import { UIElement } from './UIElement';
import { any, mock } from 'jest-mock-extended';
import { AdyenCheckout, ThreeDS2Challenge, ThreeDS2DeviceFingerprint } from '../../../index';
import { UIElementProps } from './types';
import { Resources } from '../../../core/Context/Resources';
import { PaymentActionsType } from '../../../types/global-types';
import AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import { ErrorEventType } from '../../../core/Analytics/events/AnalyticsErrorEvent';
import { render, screen } from '@testing-library/preact';

jest.mock('../../../core/Services/get-translations');

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
    public handleAdditionalDetails(data) {
        super.handleAdditionalDetails(data);
    }
    protected override componentToRender() {
        return <div>myelement</div>;
    }
}

const submitMock = jest.fn();
(global as any).HTMLFormElement.prototype.submit = () => submitMock;

let core;
beforeEach(() => {
    core = setupCoreMock();
});

afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});

describe('UIElement', () => {
    describe('icon()', () => {
        test('should generate the icon URL by getting the tx variant from type() getter', () => {
            const resources = mock<Resources>();
            resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

            const txVariant = 'klarna_b2b';

            const element = new MyElement(core, { type: txVariant, modules: { resources } });

            const typeSpy = jest.spyOn(element, 'type', 'get');
            const iconUrl = element.icon;

            expect(typeSpy).toHaveBeenCalledTimes(1);
            expect(iconUrl).toBe(`https://checkout-adyen.com/${txVariant}`);
        });
    });

    describe('onChange()', () => {
        test('should call "onChange" prop if available', () => {
            const onChange = jest.fn();
            const element = new MyElement(core, { onChange });

            element.callOnChange();

            expect(onChange.mock.calls.length).toBe(1);
        });
    });

    describe('isValid()', () => {
        test('should be false by default', () => {
            class PristineUiElement extends UIElement {
                protected override componentToRender() {
                    return <div>test</div>;
                }
            }
            const element = new PristineUiElement(core);
            expect(element.isValid).toBe(false);
        });
    });

    describe('showValidation()', () => {
        test("should trigger the component's showValidation method", () => {
            const showValidation = jest.fn();
            const element = new MyElement(core);

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
            const element = new MyElement(core, { name: 'SuperPay' });
            expect(element.displayName).toEqual('SuperPay');
        });

        test('should use the constructor type if no name property is passed', () => {
            const element = new MyElement(core);
            expect(element.displayName).toEqual('super_pay');
        });

        test('should use the name from payment methods response', () => {
            core.paymentMethodsResponse.paymentMethods = [
                {
                    name: 'SuperPayeee',
                    type: 'super_pay'
                }
            ];

            const element = new MyElement(core);
            expect(element.displayName).toEqual('SuperPayeee');
        });

        test('should use the name prop as it has precedence over payment methods response name property', () => {
            core.paymentMethodsResponse.paymentMethods = [
                {
                    name: 'SuperPayeee',
                    type: 'super_pay'
                }
            ];

            const element = new MyElement(core, { name: 'SuperbPay' });
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
                token: 'eyJ0aHJlZURTTWV0aG9kTm90a...',
                type: 'threeDS2' as PaymentActionsType
            };

            const checkout = await AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456'
            });

            const element = new MyElement(checkout).mount('body');

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
                token: 'xxx',
                paymentMethodType: 'scheme',
                type: 'threeDS2' as PaymentActionsType
            };

            const checkout = await AdyenCheckout({
                countryCode: 'US',
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false }
            });

            const element = new MyElement(checkout, { challengeWindowSize: '02' }).mount('body');

            const actionComponent = element.handleAction(challengeAction);
            expect(actionComponent instanceof ThreeDS2Challenge).toEqual(true);
            expect(actionComponent.props.elementRef).not.toBeDefined();
            expect(actionComponent.props.statusType).toEqual('custom');
            expect(actionComponent.props.isDropin).toBe(false);
            expect((actionComponent as unknown as ThreeDS2Challenge).props.challengeWindowSize).toEqual('02');
        });

        test('should throw Error if merchant passes the whole response object', () => {
            const paymentResponse = {
                action: {
                    paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                    authorisationToken: 'BQABAQCmFNEdaCE3rcbbB...',
                    subtype: 'challenge',
                    token: 'xxx',
                    paymentMethodType: 'scheme',
                    type: 'threeDS2' as PaymentActionsType
                },
                resultCode: 'IdentifyShopper'
            };

            const element = new MyElement(core).mount('body');

            expect(() => {
                // @ts-ignore tslint is not applicable here as merchant can potentially pass wrong object
                element.handleAction(paymentResponse);
            }).toThrow('have you passed in the whole response object by mistake?');
        });

        test('should throw Error if merchant passes an invalid action', () => {
            const action = {
                paymentMethodType: 'scheme'
            };

            const element = new MyElement(core).mount('body');

            expect(() => {
                // @ts-ignore tslint is not applicable here as merchant can potentially pass wrong object
                element.handleAction(action);
            }).toThrow('the passed action object does not have a "type" property');
        });
    });

    describe('submit()', () => {
        test('should trigger showValidation() and not call makePaymentsCall() if component is not valid', () => {
            const showValidation = jest.fn();

            const element = new MyElement(core);

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

        test('should make successfully payment using advanced flow', async () => {
            const onPaymentCompletedMock = jest.fn();
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Authorized'
                });
            });
            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);
            jest.spyOn(MyElement.prototype, 'data', 'get').mockReturnValue({
                clientStateDataIndicator: true,
                paymentMethod: {
                    type: 'payment-type'
                }
            });

            const element = new MyElement(core, {
                onSubmit: onSubmitMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentCompletedMock).toHaveBeenCalledWith({ resultCode: 'Authorized' }, element);
        });

        test('should make successful payment using sessions flow', async () => {
            const onPaymentCompletedMock = jest.fn();

            core.session.submitPayment.calledWith(any()).mockResolvedValue({
                resultCode: 'Authorised',
                sessionData: 'session-data',
                sessionResult: 'session-result'
            });

            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);
            jest.spyOn(MyElement.prototype, 'data', 'get').mockReturnValue({
                clientStateDataIndicator: true,
                paymentMethod: {
                    type: 'payment-type'
                }
            });

            const element = new MyElement(core, {
                onPaymentCompleted: onPaymentCompletedMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentCompletedMock).toHaveBeenCalledWith(
                {
                    resultCode: 'Authorised',
                    sessionData: 'session-data',
                    sessionResult: 'session-result'
                },
                element
            );
        });

        test('should call onPaymentFailed if payment contains non-successful result code', async () => {
            const onPaymentFailedMock = jest.fn();
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Refused'
                });
            });
            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);
            jest.spyOn(MyElement.prototype, 'data', 'get').mockReturnValue({
                clientStateDataIndicator: true,
                paymentMethod: {
                    type: 'payment-type'
                }
            });

            const element = new MyElement(core, {
                onSubmit: onSubmitMock,
                onPaymentFailed: onPaymentFailedMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentFailedMock).toHaveBeenCalledWith({ resultCode: 'Refused' }, element);
        });

        test('should call onPaymentFailed if payment is rejected', async () => {
            const onPaymentFailedMock = jest.fn();
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.reject();
            });
            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);

            const element = new MyElement(core, {
                onSubmit: onSubmitMock,
                onPaymentFailed: onPaymentFailedMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentFailedMock).toHaveBeenCalledWith(undefined, element);
        });

        test('should call component.handleAction if payment is resolved with action', async () => {
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Pending',
                    action: {
                        type: 'sdk',
                        paymentMethodType: 'payment-type',
                        paymentData: 'payment-data'
                    }
                });
            });

            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);

            const element = new MyElement(core, {
                onSubmit: onSubmitMock
            });

            const handleActionSpy = jest.spyOn(element, 'handleAction');

            element.submit();

            await new Promise(process.nextTick);

            expect(handleActionSpy).toHaveBeenCalledTimes(1);
            expect(handleActionSpy).toHaveBeenCalledWith({
                type: 'sdk',
                paymentMethodType: 'payment-type',
                paymentData: 'payment-data'
            });
        });

        test('should trigger core.update if there is pending order when using sessions', async () => {
            const order = {
                amount: {
                    currency: 'EUR',
                    value: 2001
                },
                expiresAt: '2023-10-10T13:12:59.00Z',
                orderData: 'order-mock',
                pspReference: 'MHCDBZCH4NF96292',
                reference: 'ABC123',
                remainingAmount: {
                    currency: 'EUR',
                    value: 100
                }
            };

            const onOrderUpdatedMock = jest.fn();

            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);
            core.update.calledWith(any()).mockResolvedValue(core);
            core.session.submitPayment.calledWith(any()).mockResolvedValue({
                resultCode: 'Pending',
                // @ts-ignore  ADD ORDER TO SESSION CHECKOUT RESPONSE
                order,
                sessionData: 'session-data',
                sessionResult: 'session-result'
            });

            const element = new MyElement(core, {
                onOrderUpdated: onOrderUpdatedMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(core.update).toHaveBeenCalledTimes(1);
            expect(core.update).toHaveBeenCalledWith({ order });

            expect(onOrderUpdatedMock).toHaveBeenCalledTimes(1);
            expect(onOrderUpdatedMock).toHaveBeenCalledWith({ order });
        });

        test('should trigger onPaymentMethodsRequest if there is a pending order when using advanced flow', async () => {
            const order = {
                amount: {
                    currency: 'EUR',
                    value: 2001
                },
                expiresAt: '2023-10-10T13:12:59.00Z',
                orderData: 'order-mock',
                pspReference: 'MHCDBZCH4NF96292',
                reference: 'ABC123',
                remainingAmount: {
                    currency: 'EUR',
                    value: 100
                }
            };
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Pending',
                    order
                });
            });
            const onPaymentMethodsRequestMock = jest.fn().mockImplementation((data, actions) => {
                actions.resolve({
                    paymentMethods: [],
                    storedPaymentMethods: []
                });
            });
            const onOrderUpdatedMock = jest.fn();

            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);
            core.update.calledWith(any()).mockResolvedValue(core);
            core.options.locale = 'en-US';
            core.session = null;

            const element = new MyElement(core, {
                onSubmit: onSubmitMock,
                onPaymentMethodsRequest: onPaymentMethodsRequestMock,
                onOrderUpdated: onOrderUpdatedMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(onPaymentMethodsRequestMock).toHaveBeenCalledTimes(1);
            expect(onPaymentMethodsRequestMock.mock.calls[0][0]).toStrictEqual({
                order: {
                    orderData: 'order-mock',
                    pspReference: 'MHCDBZCH4NF96292'
                },
                locale: 'en-US'
            });

            expect(core.update).toHaveBeenCalledTimes(1);
            expect(core.update).toHaveBeenCalledWith({
                paymentMethodsResponse: {
                    paymentMethods: [],
                    storedPaymentMethods: []
                },
                order,
                amount: order.remainingAmount
            });

            expect(onOrderUpdatedMock).toHaveBeenCalledTimes(1);
            expect(onOrderUpdatedMock).toHaveBeenCalledWith({ order });
        });

        test('should NOT throw an error if onPaymentMethodsRequest is not implemented, and the flow should continue', async () => {
            const order = {
                amount: {
                    currency: 'EUR',
                    value: 2001
                },
                expiresAt: '2023-10-10T13:12:59.00Z',
                orderData: 'order-mock',
                pspReference: 'MHCDBZCH4NF96292',
                reference: 'ABC123',
                remainingAmount: {
                    currency: 'EUR',
                    value: 100
                }
            };
            const onSubmitMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Pending',
                    order
                });
            });
            const onOrderUpdatedMock = jest.fn();
            const onErrorMock = jest.fn();

            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);
            core.update.calledWith(any()).mockResolvedValue(core);
            core.options.locale = 'en-US';
            core.session = null;

            const element = new MyElement(core, {
                onSubmit: onSubmitMock,
                onOrderUpdated: onOrderUpdatedMock,
                onError: onErrorMock
            });

            element.submit();

            await new Promise(process.nextTick);

            expect(onErrorMock).toHaveBeenCalledTimes(0);

            expect(core.update).toHaveBeenCalledTimes(1);
            expect(core.update).toHaveBeenCalledWith({
                order,
                amount: order.remainingAmount
            });

            expect(onOrderUpdatedMock).toHaveBeenCalledTimes(1);
            expect(onOrderUpdatedMock).toHaveBeenCalledWith({ order });
        });

        test('should send an error event to analytic module with correct errorType and error code, if makePayment call fails', async () => {
            const errorCode = 'mockedErrorCode';
            const txVariant = 'scheme';

            core.session.submitPayment.mockImplementation(() => Promise.reject(new AdyenCheckoutError('NETWORK_ERROR', '', { code: errorCode })));
            jest.spyOn(MyElement.prototype, 'isValid', 'get').mockReturnValue(true);

            const element = new MyElement(core, { type: txVariant });
            element.submit();

            await new Promise(process.nextTick);

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
                code: errorCode,
                errorType: ErrorEventType.apiError,
                timestamp: expect.any(String),
                id: expect.any(String),
                component: expect.any(String)
            });
        });
    });

    describe('[Internal] handleAdditionalDetails()', () => {
        test('should make successfully payment/details using advanced flow', async () => {
            const onPaymentCompletedMock = jest.fn();
            const onAdditionalDetailsMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Authorized'
                });
            });

            const element = new MyElement(core, {
                onAdditionalDetails: onAdditionalDetailsMock,
                onPaymentCompleted: onPaymentCompletedMock
            });

            const data = {
                data: {
                    details: {
                        paymentSource: 'paypal'
                    },
                    paymentData: 'payment-data'
                }
            };

            // @ts-ignore Testing internal implementation
            element.handleAdditionalDetails(data);

            await new Promise(process.nextTick);

            expect(onAdditionalDetailsMock).toHaveBeenCalledTimes(1);
            expect(onAdditionalDetailsMock.mock.calls[0][0]).toEqual(data);

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentCompletedMock).toHaveBeenCalledWith({ resultCode: 'Authorized' }, element);
        });

        test('should make successfully payment/details using sessions flow', async () => {
            const onPaymentCompletedMock = jest.fn();

            const element = new MyElement(core, {
                onPaymentCompleted: onPaymentCompletedMock
            });

            core.session.submitDetails.calledWith(any()).mockResolvedValue({
                resultCode: 'Authorised',
                sessionData: 'session-data',
                sessionResult: 'session-result'
            });

            const state = {
                data: {
                    details: {
                        paymentSource: 'paypal'
                    },
                    paymentData: 'payment-data'
                }
            };

            // @ts-ignore Testing internal implementation
            element.handleAdditionalDetails(state);

            await new Promise(process.nextTick);

            expect(core.session.submitDetails).toHaveBeenCalledTimes(1);
            expect(core.session.submitDetails).toHaveBeenCalledWith(state.data);

            expect(onPaymentCompletedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentCompletedMock).toHaveBeenCalledWith(
                { resultCode: 'Authorised', sessionData: 'session-data', sessionResult: 'session-result' },
                element
            );
        });

        test('should call onPaymentFailed if payment/details contains non-successful result code', async () => {
            const onPaymentFailedMock = jest.fn();
            const onAdditionalDetailsMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.resolve({
                    resultCode: 'Refused'
                });
            });

            const element = new MyElement(core, {
                onAdditionalDetails: onAdditionalDetailsMock,
                onPaymentFailed: onPaymentFailedMock
            });

            const data = {
                data: {
                    details: {
                        paymentSource: 'paypal'
                    },
                    paymentData: 'payment-data'
                }
            };

            // @ts-ignore Testing internal implementation
            element.handleAdditionalDetails(data);

            await new Promise(process.nextTick);

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentFailedMock).toHaveBeenCalledWith({ resultCode: 'Refused' }, element);
        });

        test('should call onPaymentFailed if payment is rejected', async () => {
            const onPaymentFailedMock = jest.fn();
            const onAdditionalDetailsMock = jest.fn().mockImplementation((data, component, actions) => {
                actions.reject();
            });

            const element = new MyElement(core, {
                onAdditionalDetails: onAdditionalDetailsMock,
                onPaymentFailed: onPaymentFailedMock
            });

            const data = {
                data: {
                    details: {
                        paymentSource: 'paypal'
                    },
                    paymentData: 'payment-data'
                }
            };

            // @ts-ignore Testing internal implementation
            element.handleAdditionalDetails(data);

            await new Promise(process.nextTick);

            expect(onPaymentFailedMock).toHaveBeenCalledTimes(1);
            expect(onPaymentFailedMock).toHaveBeenCalledWith(undefined, element);
        });

        test('should send an error event to analytic module with correct errorType and error code, if payment/details call fails', async () => {
            const errorCode = 'mockedErrorCode';
            const txVariant = 'scheme';

            core.session.submitDetails.mockImplementation(() => Promise.reject(new AdyenCheckoutError('NETWORK_ERROR', '', { code: errorCode })));

            const element = new MyElement(core, { type: txVariant });
            element.handleAdditionalDetails({});
            await new Promise(process.nextTick);

            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
                code: errorCode,
                errorType: ErrorEventType.apiError,
                timestamp: expect.any(String),
                id: expect.any(String),
                component: expect.any(String)
            });
        });
    });

    describe('render()', () => {
        test('should return the result of render method', () => {
            const element = new MyElement(core);
            render(element.render());
            expect(screen.getAllByText('myelement')[0]).toBeInTheDocument();
        });
    });
});
