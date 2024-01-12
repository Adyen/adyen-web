import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import processBrand from './processBrand';
import { SFFeedbackObj } from '../../types';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../configuration/constants';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

const csfState = { brand: { brand: null, cvcPolicy: 'required' }, type: null, securedFields: { encryptedSecurityCode: { numKey: 654321 } } };
const csfProps = { rootNode: 'div' };
const csfConfig = {};
const csfCallbacks = { onBrand: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

const sfFeedbackObj: SFFeedbackObj = {
    action: 'foo',
    brand: 'amex',
    numKey: 654321,
    fieldType: ENCRYPTED_SECURITY_CODE,
    cvcPolicy: 'required',
    expiryDatePolicy: 'required',
    showSocialSecurityNumber: false,
    type: null
};

const expectedPostMsgDataObj = {
    txVariant: 'card',
    brand: 'amex',
    fieldType: ENCRYPTED_SECURITY_CODE,
    cvcPolicy: 'required',
    numKey: 654321
};

const expectedCallbackObj = {
    brand: 'amex',
    cvcPolicy: 'required',
    expiryDatePolicy: 'required',
    showSocialSecurityNumber: false,
    type: 'card',
    rootNode: 'div'
};

const callProcessBrand = () => {
    // @ts-ignore - test is faking setup object
    processBrand(CSFObj, sfFeedbackObj);
};

describe('Testing processBrand fny', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### processBrand.test::FN call:: ', obj));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        csfCallbacks.onBrand = jest.fn(() => {});

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();
    });

    test('Calling processBrand will not lead to a call to postMessageToIframe since feedback object is not for an "encryptedCardNumber" field', () => {
        callProcessBrand();

        expect(postMessageToIframeMock).not.toHaveBeenCalled();
    });

    test('Calling processBrand will not lead to a call to postMessageToIframe since state object does not have type "card"; nor will the onBrand callback get called', () => {
        sfFeedbackObj.fieldType = ENCRYPTED_CARD_NUMBER;
        callProcessBrand();

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(csfCallbacks.onBrand).not.toHaveBeenCalled();
    });

    test('Calling processBrand will lead to a call to postMessageToIframe since state object has type "card"; and the onBrand callback will be called', () => {
        csfState.type = 'card';
        callProcessBrand();

        expect(postMessageToIframeMock).toHaveBeenCalled();
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj);

        expect(csfCallbacks.onBrand).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onBrand).toHaveBeenCalledWith(expectedCallbackObj);
    });

    test('Calling processBrand will lead to a call to postMessageToIframe since state object has type "bcmc" (& the brand has changed); and the onBrand callback will be called', () => {
        csfState.type = 'bcmc';
        sfFeedbackObj.brand = 'maestro';

        expectedPostMsgDataObj.txVariant = 'bcmc';
        expectedPostMsgDataObj.brand = 'maestro';

        expectedCallbackObj.type = 'bcmc';
        expectedCallbackObj.brand = 'maestro';

        callProcessBrand();

        expect(postMessageToIframeMock).toHaveBeenCalled();
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj);

        expect(csfCallbacks.onBrand).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onBrand).toHaveBeenCalledWith(expectedCallbackObj);
    });

    test('Calling processBrand will not lead to another call to postMessageToIframe or onBrand since the brand has not changed', () => {
        callProcessBrand();

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(csfCallbacks.onBrand).not.toHaveBeenCalled();
    });
});
