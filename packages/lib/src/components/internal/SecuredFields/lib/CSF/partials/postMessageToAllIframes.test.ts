import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { postMessageToAllIframes } from './postMessageToAllIframes';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE, ENCRYPTED_SECURITY_CODE } from '../../configuration/constants';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

const csfState = {
    type: 'card',
    securedFields: { encryptedCardNumber: { numKey: 654321 }, encryptedExpiryDate: { numKey: 654321 }, encryptedSecurityCode: { numKey: 654321 } }
};
const csfConfig = { loadingContext: '*' };

const CSFObj = {
    csfState,
    csfConfig
};

const dataObj = {
    destroy: true
};

const expectedPostMsgDataObj = {
    txVariant: 'card',
    fieldType: ENCRYPTED_CARD_NUMBER,
    numKey: 654321,
    destroy: true
};

const callPostMessageToAllIframes = sfFeedbackObj => {
    // @ts-ignore - test is faking setup object
    return postMessageToAllIframes(CSFObj, sfFeedbackObj);
};

describe('Testing postMessageToAllIframes fny', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### postMessageToAllIframes.test::FN call:: ', obj));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();
    });

    test('Calling postMessageToAllIframes with no data object will not lead to any calls to postMessageToIframe', () => {
        const res = callPostMessageToAllIframes(null);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('Calling postMessageToAllIframes with a data object will lead to calls to postMessageToIframe for all existing securedFields', () => {
        const res = callPostMessageToAllIframes(dataObj);

        expect(postMessageToIframeMock).toHaveBeenCalledTimes(3);
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj); // PAN SF

        expectedPostMsgDataObj.fieldType = ENCRYPTED_EXPIRY_DATE;
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj); // Date SF

        expectedPostMsgDataObj.fieldType = ENCRYPTED_SECURITY_CODE;
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj); // CVC SF

        expect(res).toEqual(true);
    });
});
