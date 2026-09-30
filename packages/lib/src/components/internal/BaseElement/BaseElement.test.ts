import { h } from 'preact';
import { screen } from '@testing-library/preact';
import BaseElement from './BaseElement';
import { BaseElementProps } from './types';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../../config/testMocks/setup-core-mock';
import base64 from '../../../utils/base64';
import { ICore } from '../../../types';
import { PAYMENT_METHOD_BEHAVIOR } from '../../../core/config';
import { TxVariants } from '../../tx-variants';

const decodeSdkData = (input: string | undefined) => {
    const { data } = base64.decode(input ?? '');
    if (!data) {
        throw new Error('Failed to decode sdkData');
    }
    return JSON.parse(data);
};

class MyElement extends BaseElement<BaseElementProps> {
    public override formatData() {
        return { paymentMethod: { type: 'my-element' } };
    }
}

class NativeElement extends BaseElement<BaseElementProps> {
    public override formatData() {
        return { paymentMethod: { type: TxVariants.scheme } };
    }
}

const ROOT_NODE_NOT_FOUND = 'Component could not mount. Root node was not found.';

interface MountableElementProps extends BaseElementProps {
    label?: string;
}

const handleKeyDownMock = jest.fn();

class MountableElement extends BaseElement<MountableElementProps> {
    public override render() {
        return h('div', null, this.props.label ?? 'mountable element');
    }

    protected override handleKeyDown() {
        handleKeyDownMock();
    }

    public getMountedNode() {
        return this.mountedNode;
    }
}

describe('BaseElement', () => {
    let core: ICore;

    beforeAll(() => {
        core = setupCoreMock();
    });

    describe('formatProps', () => {
        test('should return props by default', () => {
            const baseElement = new MyElement(core);
            const props = { prop1: 'prop1' };
            // @ts-ignore Testing internal method
            expect(baseElement.formatProps(props)).toBe(props);
        });
    });

    describe('get data()', () => {
        test('should call formatData to get the specific component output', () => {
            const myElement = new MyElement(core);
            // @ts-ignore Testing internal method
            const spy = jest.spyOn(myElement, 'formatData');

            expect(myElement.data).toEqual({
                clientStateDataIndicator: true,
                riskData: { clientData: TEST_RISK_DATA },
                paymentMethod: {
                    checkoutAttemptId: TEST_CHECKOUT_ATTEMPT_ID,
                    sdkData: expect.any(String),
                    type: 'my-element'
                }
            });
            expect(spy).toHaveBeenCalled();
        });

        test('should contain the checkoutAttemptId inside the encoded sdkData', () => {
            const myElement = new MyElement(core);

            const sdkData = myElement.data.paymentMethod.sdkData;
            const decodedSdkData = decodeSdkData(sdkData);

            expect(decodedSdkData.analytics.checkoutAttemptId).toEqual(TEST_CHECKOUT_ATTEMPT_ID);
        });

        test('should not add sdkData nor attempt ID if there is no "paymentMethod" field', () => {
            class Element extends BaseElement<BaseElementProps> {}

            const myElement = new Element(core);
            expect(myElement.data).toEqual({ clientStateDataIndicator: true, riskData: { clientData: TEST_RISK_DATA } });
        });

        test('should not add risk data to sdkData if it is not available', () => {
            const core = setupCoreMock();
            const myElement = new MyElement(core);

            const sdkData = myElement.data.paymentMethod.sdkData;
            const decodedSdkData = decodeSdkData(sdkData);

            expect(decodedSdkData.clientData).toBeUndefined();
        });

        test('should set paymentMethodBehavior to GENERIC when payment method type is not a known TxVariant', () => {
            const myElement = new MyElement(core);

            const sdkData = myElement.data.paymentMethod.sdkData;
            const decodedSdkData = decodeSdkData(sdkData);

            expect(decodedSdkData.paymentMethodBehavior).toEqual(PAYMENT_METHOD_BEHAVIOR.GENERIC);
        });

        test('should set paymentMethodBehavior to NATIVE when payment method type is a known TxVariant', () => {
            const nativeElement = new NativeElement(core);

            const sdkData = nativeElement.data.paymentMethod.sdkData;
            const decodedSdkData = decodeSdkData(sdkData);

            expect(decodedSdkData.paymentMethodBehavior).toEqual(PAYMENT_METHOD_BEHAVIOR.NATIVE);
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const baseElement = new MyElement(core);
            expect(() => baseElement.render()).toThrow();
        });
    });

    describe('mounting lifecycle', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            container.remove();
            handleKeyDownMock.mockClear();
        });

        describe('mount()', () => {
            test('should throw if the selector does not match any node', () => {
                const element = new MountableElement(core);
                expect(() => element.mount('#does-not-exist')).toThrow(ROOT_NODE_NOT_FOUND);
            });

            test('should render the element into the given node', () => {
                new MountableElement(core).mount(container);
                expect(screen.getByText('mountable element')).toBeInTheDocument();
            });
        });

        describe('mountedNode', () => {
            test('should throw the root node error if the element has not been mounted', () => {
                const element = new MountableElement(core);
                expect(() => element.getMountedNode()).toThrow(ROOT_NODE_NOT_FOUND);
            });

            test('should return the node the element is mounted into', () => {
                const element = new MountableElement(core).mount(container);
                expect(element.getMountedNode()).toBe(container);
            });
        });

        describe('update()', () => {
            test('should throw the root node error if the element has not been mounted', () => {
                const element = new MountableElement(core);
                expect(() => element.update({ label: 'updated' })).toThrow(ROOT_NODE_NOT_FOUND);
            });

            test('should re-render the element with the new props into the same node', () => {
                const element = new MountableElement(core).mount(container);

                element.update({ label: 'updated' });

                expect(element.getMountedNode()).toBe(container);
                expect(screen.getByText('updated')).toBeInTheDocument();
                expect(screen.queryByText('mountable element')).not.toBeInTheDocument();
            });
        });

        describe('unmount()', () => {
            test('should not throw and return the element if it has not been mounted', () => {
                const element = new MountableElement(core);
                expect(element.unmount()).toBe(element);
            });

            test('should remove the rendered content and stop listening to keydown events', () => {
                const element = new MountableElement(core).mount(container);

                container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                expect(handleKeyDownMock).toHaveBeenCalledTimes(1);

                element.unmount();
                container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

                expect(screen.queryByText('mountable element')).not.toBeInTheDocument();
                expect(handleKeyDownMock).toHaveBeenCalledTimes(1);
            });
        });
    });
});
