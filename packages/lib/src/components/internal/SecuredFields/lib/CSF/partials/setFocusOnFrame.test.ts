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

describe('Analytics initialisation and event queue', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### setFocusOnFrame.test::FN call:: ', obj));

    beforeEach(() => {
        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(postMessageToIframeMock);
        postMessageToIframeMock.mockClear();
    });

    test('Creates an Analytics module with defaultProps', () => {
        // @ts-ignore - test is faking setup object
        setFocusOnFrame(CSFObj, 'encryptedSecurityCode');

        expect(postMessageToIframeMock).toHaveBeenCalled();
        // expect(postMessageToIframeMock).toHaveBeenCalledWith({
        //     txVariant: 'card',
        //     fieldType: 'encryptedSecurityCode',
        //     focus: true,
        //     numKey: 654321
        // });
    });
});
