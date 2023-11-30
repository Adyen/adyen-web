import { handleIframeConfigFeedback } from './handleIframeConfigFeedback';

const csfState = { type: 'card', isConfigured: false, originalNumIframes: 3, iframeConfigCount: 0 };
const csfProps = {};
const csfConfig = {};
const csfCallbacks = { onAdditionalSFConfig: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

const feedbackObj = {
    action: 'config',
    fieldType: 'encryptedCardNumber',
    numKey: 1244301008
};

let onAdditionalSFConfigCallbackObj = null;

csfCallbacks.onAdditionalSFConfig = jest.fn(callbackObj => {
    onAdditionalSFConfigCallbackObj = callbackObj;
    console.log('### handleIframeConfigFeedback.test::onAdditionalSFConfig callback called:: callbackObj', callbackObj);
});

const isConfigured = jest.fn(() => console.log('### handleIframeConfigFeedback.test:::: isConfigured is called'));

const callHandleIframeConfigFeedback = () => {
    // @ts-ignore - test is faking setup object
    return handleIframeConfigFeedback(CSFObj, isConfigured, feedbackObj);
};

describe('Testing CSFs handleIframeConfigFeedback functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
    });

    test('isConfigured should not be called since the iframe count is still below the total', () => {
        const res = callHandleIframeConfigFeedback();

        expect(isConfigured).not.toHaveBeenCalled();

        expect(res).toEqual(false);
    });

    test('isConfigured should be called since the iframe count is the same as the total', () => {
        csfState.iframeConfigCount = 2;

        const res = callHandleIframeConfigFeedback();

        expect(isConfigured).toHaveBeenCalled();

        expect(res).toEqual(true);
    });

    test('isConfigured should be not called again since we are now mocking an additional securedField being added i.e. KCP scenario', () => {
        csfState.isConfigured = true;
        feedbackObj.fieldType = 'encryptedPassword';

        const res = callHandleIframeConfigFeedback();

        // no new call to isConfigured
        expect(isConfigured).toHaveBeenCalledTimes(1);

        expect(csfCallbacks.onAdditionalSFConfig).toHaveBeenCalledTimes(1);
        expect(onAdditionalSFConfigCallbackObj).toEqual({
            additionalIframeConfigured: true,
            fieldType: 'encryptedPassword',
            type: 'card'
        });

        expect(res).toEqual(false);
    });
});
