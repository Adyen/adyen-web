import { handleFocus } from './handleFocus';
import ua from '../utils/userAgent';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../configuration/constants';

ua.__IS_IOS = false;

const csfState = { type: 'card', currentFocusObject: null, registerFieldForIos: false };
const csfProps = { rootNode: 'div' };
const csfCallbacks = { onFocus: null };

const CSFObj = {
    csfState,
    csfProps,
    csfCallbacks
};

const feedbackObj = {
    action: 'focus',
    focus: true,
    numChars: 0,
    fieldType: ENCRYPTED_CARD_NUMBER,
    numKey: 896044601
};

const expectedCallbackObj = {
    action: 'focus',
    focus: true,
    numChars: 0,
    fieldType: ENCRYPTED_CARD_NUMBER,
    rootNode: 'div',
    type: 'card',
    currentFocusObject: ENCRYPTED_CARD_NUMBER
};

const handleIOSTouchEvents = jest.fn(() => {});

const callOnFocus = () => {
    // @ts-ignore - test is faking setup object
    handleFocus(CSFObj, handleIOSTouchEvents, feedbackObj);
};

describe('Testing CSFs handleFocus functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        csfCallbacks.onFocus = jest.fn(() => {});
    });

    test('handleFocus should simulate focus event on PAN, when not in iOS scenario', () => {
        callOnFocus();

        expect(csfState.currentFocusObject).toEqual(ENCRYPTED_CARD_NUMBER);

        expect(handleIOSTouchEvents).not.toHaveBeenCalled(); // not iOS

        expect(csfCallbacks.onFocus).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onFocus).toHaveBeenCalledWith(expectedCallbackObj);
    });

    test('handleFocus should see that repeating focus event on PAN, in iOS scenario, does not see handleIOSTouchEvents, since currentFocusObject has not changed', () => {
        ua.__IS_IOS = true;
        callOnFocus();

        expect(csfState.currentFocusObject).toEqual(ENCRYPTED_CARD_NUMBER);

        expect(handleIOSTouchEvents).not.toHaveBeenCalled();

        expect(csfCallbacks.onFocus).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onFocus).toHaveBeenCalledWith(expectedCallbackObj);
    });

    test('handleFocus should simulate focus moving to CVC, in iOS scenario', () => {
        ua.__IS_IOS = true;
        feedbackObj.fieldType = ENCRYPTED_SECURITY_CODE;
        expectedCallbackObj.fieldType = ENCRYPTED_SECURITY_CODE;
        expectedCallbackObj.currentFocusObject = ENCRYPTED_SECURITY_CODE;

        callOnFocus();

        expect(csfState.currentFocusObject).toEqual(ENCRYPTED_SECURITY_CODE);

        expect(handleIOSTouchEvents).toHaveBeenCalled(); // iOS scenario

        expect(csfCallbacks.onFocus).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onFocus).toHaveBeenCalledWith(expectedCallbackObj);
    });

    test('handleFocus should simulate blur event (on CVC field)', () => {
        feedbackObj.focus = false;
        expectedCallbackObj.currentFocusObject = null;
        expectedCallbackObj.focus = false;

        callOnFocus();

        expect(csfState.currentFocusObject).toEqual(null);

        expect(csfCallbacks.onFocus).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onFocus).toHaveBeenCalledWith(expectedCallbackObj);
    });
});
