import { isConfigured } from './isConfigured';
import * as logger from '../../utilities/logger';

const csfState = { type: 'card', isConfigured: false, numIframes: 3 };
const csfProps = { rootNode: 'div' };
const csfConfig = { isCreditCardType: true };
const csfCallbacks = { onConfigSuccess: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

let onConfigSuccessCallbackObj = null;

let consoleError = null;

csfCallbacks.onConfigSuccess = jest.fn(callbackObj => {
    onConfigSuccessCallbackObj = callbackObj;
});

const validateForm = jest.fn(() => console.log('### isConfigured.test:::: validateForm is called'));

const callIsConfigured = () => {
    // @ts-ignore - test is faking setup object
    return isConfigured(CSFObj, validateForm);
};

describe('Testing CSFs isConfigured functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        // @ts-ignore allow jset override of error loggers
        console.error = logger.error = jest.fn(error => {
            consoleError = error;
        });

        onConfigSuccessCallbackObj = null;
    });

    test('onConfigSuccess callback should be called since this is the purpose of this function, but validateForm is not called since we are dealing with 3 securedFields', () => {
        const res = callIsConfigured();

        expect(csfCallbacks.onConfigSuccess).toHaveBeenCalledTimes(1);
        expect(onConfigSuccessCallbackObj).toEqual({ iframesConfigured: true, type: 'card', rootNode: 'div' });

        expect(validateForm).not.toHaveBeenCalled();

        expect(res).toEqual(true);
    });

    test('Console should show an error since we are saying we have a recurringCard - but the type is "card"', () => {
        csfState.numIframes = 1;
        const res = callIsConfigured();

        expect(csfCallbacks.onConfigSuccess).toHaveBeenCalledTimes(2);
        expect(onConfigSuccessCallbackObj).toEqual({ iframesConfigured: true, type: 'card', rootNode: 'div' });

        expect(validateForm).not.toHaveBeenCalled();

        expect(res).toEqual(false);
        expect(consoleError).toEqual("ERROR: Payment method with a single secured field - but 'type' has not been set to a specific card brand");
    });

    test('validateForm should not be called since we are dealing with a recurring card that has a cvcPolicy that equals "reguired"', () => {
        csfState.type = 'visa';
        const res = callIsConfigured();

        expect(csfCallbacks.onConfigSuccess).toHaveBeenCalledTimes(3);
        expect(onConfigSuccessCallbackObj).toEqual({ iframesConfigured: true, type: 'visa', rootNode: 'div' });

        expect(validateForm).not.toHaveBeenCalled();

        expect(res).toEqual(true);
    });

    test('validateForm should not be called since we are dealing with a recurring card of an unknown txvariant', () => {
        csfState.type = 'visa_tokenised_subvariant';
        const res = callIsConfigured();

        expect(csfCallbacks.onConfigSuccess).toHaveBeenCalledTimes(4);
        expect(onConfigSuccessCallbackObj).toEqual({ iframesConfigured: true, type: 'visa_tokenised_subvariant', rootNode: 'div' });

        expect(validateForm).not.toHaveBeenCalled();

        expect(res).toEqual(true);
    });

    test('validateForm should be called since we are dealing with a known recurring card that has a cvcPolicy that equals "optional"', () => {
        csfState.type = 'laser';
        const res = callIsConfigured();

        expect(csfCallbacks.onConfigSuccess).toHaveBeenCalledTimes(5);
        expect(onConfigSuccessCallbackObj).toEqual({ iframesConfigured: true, type: 'laser', rootNode: 'div' });

        expect(validateForm).toHaveBeenCalled();

        expect(res).toEqual(true);
    });
});
