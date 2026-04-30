import BaseElement from './BaseElement';
import { BaseElementProps } from './types';
import { setupCoreMock, TEST_CHECKOUT_ATTEMPT_ID, TEST_RISK_DATA } from '../../../../config/testMocks/setup-core-mock';
import base64 from '../../../utils/base64';
import { ICore } from '../../../types';

class MyElement extends BaseElement<BaseElementProps> {
    public override formatData() {
        return { paymentMethod: { type: 'my-element' } };
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
            const decodedSdkData = JSON.parse(base64.decode(sdkData).data);

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
            const decodedSdkData = JSON.parse(base64.decode(sdkData).data);

            expect(decodedSdkData.clientData).toBeUndefined();
        });
    });

    describe('render', () => {
        test('does not render anything by default', () => {
            const baseElement = new MyElement(core);
            expect(() => baseElement.render()).toThrow();
        });
    });
});
