import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { setFocusOnFrame } from './setFocusOnFrame';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

const csfState = { type: 'card', securedFields: { encryptedSecurityCode: { numKey: 654321 } } };
const csfConfig = {};

const CSFObj = {
    csfState,
    csfConfig
};

describe('Testing setFocusOnFrame fny', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### setFocusOnFrame.test::FN call:: ', obj));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();
    });

    test('Calling setFocusOnFrame will lead to a call to postMessageToIframe', () => {
        // @ts-ignore - test is faking setup object
        setFocusOnFrame(CSFObj, 'encryptedSecurityCode');

        expect(postMessageToIframeMock).toHaveBeenCalledWith({
            txVariant: 'card',
            fieldType: 'encryptedSecurityCode',
            focus: true,
            numKey: 654321
        });
    });

    test('Calling setFocusOnFrame will not lead to a call to postMessageToIframe since the securedFields prop has no "encryptedCardNumber" key', () => {
        // @ts-ignore - test is faking setup object
        setFocusOnFrame(CSFObj, 'encryptedCardNumber');

        expect(postMessageToIframeMock).not.toHaveBeenCalled();
    });
});
