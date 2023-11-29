import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { SFFeedbackObj } from '../../types';
import { processAutoComplete } from './processAutoComplete';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const csfState = {
    brand: { brand: null, cvcPolicy: 'required' },
    type: 'card',
    securedFields: { encryptedExpiryDate: { numKey: 654321 }, encryptedExpiryMonth: { numKey: 654321 }, encryptedExpiryYear: { numKey: 654321 } }
};
const csfProps = {};
const csfConfig = {};
const csfCallbacks = { onAutoComplete: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

let acType = null;

const nameCallbackObj = {
    action: 'autoComplete',
    name: 'cc-name',
    value: 'nn',
    fieldType: 'encryptedCardNumber'
};

csfCallbacks.onAutoComplete = jest.fn(callbackObj => {
    acType = callbackObj;
});

const sfFeedbackObj_name: SFFeedbackObj = {
    action: 'autoComplete',
    name: 'cc-name',
    value: 'nn',
    fieldType: 'encryptedCardNumber',
    numKey: 654321
};

const sfFeedbackObj_date: SFFeedbackObj = {
    action: 'autoComplete',
    name: 'cc-exp',
    value: '03/2030',
    fieldType: 'encryptedCardNumber',
    numKey: 654321
};

const expectedPostMsgDataObj = {
    txVariant: 'card',
    fieldType: 'encryptedExpiryDate',
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

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();
    });

    test('Calling processAutoComplete will not lead to a call to postMessageToIframe since we are auto-filling the name so only the callback fn should be called', () => {
        const res = callProcessAutoComplete(sfFeedbackObj_name);

        expect(csfCallbacks.onAutoComplete).toHaveBeenCalledTimes(1);
        expect(acType).toEqual(nameCallbackObj);

        expect(postMessageToIframeMock).not.toHaveBeenCalled();

        expect(res).toEqual(true);
    });

    test('Calling processAutoComplete will not call anything & return false since the date is not long enough', () => {
        sfFeedbackObj_date.value = '03';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        // callback not called a second time
        expect(csfCallbacks.onAutoComplete).toHaveBeenCalledTimes(1);

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

    test('Calling processAutoComplete will call postMessageToIframe sending it the expected expiryDate related data object', () => {
        sfFeedbackObj_date.value = '03/2030';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

        expect(postMessageToIframeMock).toHaveBeenCalled();
        expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedPostMsgDataObj);

        expect(res).toEqual(true);
    });

    test('Calling processAutoComplete will call postMessageToIframe twice sending it the expected expiryMonth and then expiryYear data objects', () => {
        sfFeedbackObj_date.value = '3/2030'; // also test the month padding fny

        delete csfState.securedFields.encryptedExpiryDate;

        expectedPostMsgDataObj.fieldType = 'encryptedExpiryMonth';
        expectedPostMsgDataObj.autoComplete = '03';

        const res = callProcessAutoComplete(sfFeedbackObj_date);

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
});
