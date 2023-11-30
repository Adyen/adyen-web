import { handleFocus } from './handleFocus';
import ua from '../utils/userAgent';

ua.__IS_IOS = true;

const csfState = { type: 'card', currentFocusObject: null, registerFieldForIos: false };
const csfProps = { rootNode: 'div' };
const csfConfig = {};
const csfCallbacks = { onFocus: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

const feedbackObj = {
    action: 'focus',
    focus: true,
    numChars: 0,
    fieldType: 'encryptedCardNumber',
    numKey: 896044601
};

let onFocusCallbackObj = null;

csfCallbacks.onFocus = jest.fn(callbackObj => {
    onFocusCallbackObj = callbackObj;
    console.log('### handleFocus.test::onFocus callback called:: callbackObj', callbackObj);
});

const expectedCallbackObj = {
    action: 'focus',
    focus: true,
    numChars: 0,
    fieldType: 'encryptedCardNumber',
    rootNode: 'div',
    type: 'card',
    currentFocusObject: 'encryptedCardNumber'
};

const callOnFocus = () => {
    // @ts-ignore - test is faking setup object
    handleFocus(CSFObj, feedbackObj);
};

describe('Testing CSFs handleFocus functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        onFocusCallbackObj = null;
    });

    test('handleFocus should simulate focus event', () => {
        callOnFocus();

        expect(csfState.currentFocusObject).toEqual('encryptedCardNumber');

        expect(csfCallbacks.onFocus).toHaveBeenCalledTimes(1);
        expect(onFocusCallbackObj).toEqual(expectedCallbackObj);
    });

    test('handleFocus should simulate blur event', () => {
        feedbackObj.focus = false;
        expectedCallbackObj.currentFocusObject = null;
        expectedCallbackObj.focus = false;

        callOnFocus();

        expect(csfState.currentFocusObject).toEqual(null);

        expect(csfCallbacks.onFocus).toHaveBeenCalledTimes(2);
        expect(onFocusCallbackObj).toEqual(expectedCallbackObj);
    });
});
