import { handleIframeConfigFeedback } from './handleIframeConfigFeedback';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_PWD_FIELD } from '../../configuration/constants';

const csfState = { type: 'card', isConfigured: false, originalNumIframes: 3, iframeConfigCount: 0 };
const csfCallbacks = { onAdditionalSFConfig: null };

const CSFObj = {
    csfState,
    csfCallbacks
};

const feedbackObj = {
    action: 'config',
    fieldType: ENCRYPTED_CARD_NUMBER,
    numKey: 1244301008
};

let isConfigured;

const callHandleIframeConfigFeedback = () => {
    // @ts-ignore - test is faking setup object
    return handleIframeConfigFeedback(CSFObj, isConfigured, feedbackObj);
};

describe('Testing CSFs handleIframeConfigFeedback functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        isConfigured = jest.fn(() => {});

        csfCallbacks.onAdditionalSFConfig = jest.fn(() => {});
    });

    test('isConfigured should not be called since the iframe count is still below the total', () => {
        const res = callHandleIframeConfigFeedback();

        expect(isConfigured).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('isConfigured should be called since the iframe count is the same as the total', () => {
        csfState.iframeConfigCount = 2;

        const res = callHandleIframeConfigFeedback();

        expect(isConfigured).toHaveBeenCalledTimes(1);

        expect(res).toEqual(true);
    });

    test('isConfigured should be not called again since we are now mocking an additional securedField being added i.e. KCP scenario', () => {
        csfState.isConfigured = true;
        feedbackObj.fieldType = ENCRYPTED_PWD_FIELD;

        const res = callHandleIframeConfigFeedback();

        // no new call to isConfigured
        expect(isConfigured).not.toHaveBeenCalled();

        expect(csfCallbacks.onAdditionalSFConfig).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onAdditionalSFConfig).toHaveBeenCalledWith({
            additionalIframeConfigured: true,
            fieldType: ENCRYPTED_PWD_FIELD,
            type: 'card'
        });

        expect(res).toEqual(false);
    });
});
