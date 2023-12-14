import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { SFFeedbackObj } from '../../types';
import { processAutoComplete } from './processAutoComplete';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_EXPIRY_DATE } from '../../configuration/constants';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const csfState = {
    brand: { brand: null, cvcPolicy: 'required' },
    type: 'card',
    securedFields: { encryptedExpiryDate: { numKey: 654321 }, encryptedExpiryMonth: { numKey: 654321 }, encryptedExpiryYear: { numKey: 654321 } }
};
const csfConfig = {};
const csfCallbacks = { onAutoComplete: null };

const CSFObj = {
    csfState,
    // csfProps,
    csfConfig,
    csfCallbacks
};

const nameCallbackObj = {
    action: 'autoComplete',
    name: 'cc-name',
    value: 'nn',
    fieldType: ENCRYPTED_CARD_NUMBER
};

const sfFeedbackObj_name: SFFeedbackObj = {
    action: 'autoComplete',
    name: 'cc-name',
    value: 'nn',
    fieldType: ENCRYPTED_CARD_NUMBER,
    numKey: 654321
};

const sfFeedbackObj_date: SFFeedbackObj = {
    action: 'autoComplete',
    name: 'cc-exp',
    value: '03/2030',
    fieldType: ENCRYPTED_CARD_NUMBER,
    numKey: 654321
};

const expectedPostMsgDataObj = {
    txVariant: 'card',
    fieldType: ENCRYPTED_EXPIRY_DATE,
    autoComplete: '03/30',
    numKey: 654321
};

const callProcessAutoComplete = sfFeedbackObj => {
    // @ts-ignore - test is faking setup object
    return processAutoComplete(CSFObj, sfFeedbackObj);
};

describe('Testing processAutoComplete fny', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### processAutoComplete.test::FN call:: ', obj));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        csfCallbacks.onAutoComplete = jest.fn(() => {});

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();
    });

    test('Calling processAutoComplete will not lead to a call to postMessageToIframe since we are auto-filling the name so only the callback fn should be called', () => {
        const res = callProcessAutoComplete(sfFeedbackObj_name);

        expect(csfCallbacks.onAutoComplete).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onAutoComplete).toHaveBeenCalledWith(nameCallbackObj);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(true);
    });

    test('Calling processAutoComplete will not call anything & return false since the date is not long enough', () => {
        sfFeedbackObj_date.value = '03';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        // callback not called a second time
        expect(csfCallbacks.onAutoComplete).not.toHaveBeenCalled();

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('Calling processAutoComplete will not call anything & return false since the year is not set', () => {
        sfFeedbackObj_date.value = '03/';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('Calling processAutoComplete will not call anything & return false since the year is not set correctly (too short)', () => {
        sfFeedbackObj_date.value = '03/1';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('Calling processAutoComplete will not call anything & return false since the year is not set correctly (3 digits)', () => {
        sfFeedbackObj_date.value = '03/999';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('Calling processAutoComplete will not call anything & return false since the year is not set correctly (not digits)', () => {
        sfFeedbackObj_date.value = '03/yyyy';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('Calling processAutoComplete will call postMessageToIframe sending it the expected expiryDate related data object, and the onAutoComplete callback will not be called', () => {
        sfFeedbackObj_date.value = '03/2030';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(csfCallbacks.onAutoComplete).not.toHaveBeenCalled();

        expect(postMessageToIframeMock).toHaveBeenCalled();
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj);

        expect(res).toEqual(true);
    });

    test('Calling processAutoComplete will call postMessageToIframe twice sending it the expected expiryMonth and then expiryYear data objects, and the onAutoComplete callback will not be called', () => {
        sfFeedbackObj_date.value = '3/2030'; // also test the month padding fny

        delete csfState.securedFields.encryptedExpiryDate;

        expectedPostMsgDataObj.fieldType = 'encryptedExpiryMonth';
        expectedPostMsgDataObj.autoComplete = '03';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(csfCallbacks.onAutoComplete).not.toHaveBeenCalled();

        expect(postMessageToIframeMock).toHaveBeenCalled();
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj);

        expect(res).toEqual(true);

        expectedPostMsgDataObj.fieldType = 'encryptedExpiryYear';
        expectedPostMsgDataObj.autoComplete = '30';

        // Fast-forward until expiryYear related timer has been executed
        jest.runAllTimers();

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);

        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj);
    });

    test('Calling processAutoComplete will not call anything & return false since the autoComplete event is not for a name or date field', () => {
        sfFeedbackObj_date.name = 'cc-csc';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });
});
