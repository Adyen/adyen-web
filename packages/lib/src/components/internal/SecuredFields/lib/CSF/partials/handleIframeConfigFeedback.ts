// Count how many iframes have successfully been configured and, if its all of them, call callback function

import { CbObjOnAdditionalSF } from '../../types';

// First, object, param comes from partial implementation
/**
 * @param csfState - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 * @param isConfigured - comes from initial, partial, implementation
 *
 * @param pFeedbackObj -
 */
export function handleIframeConfigFeedback({ csfState, csfCallbacks }, isConfigured, pFeedbackObj): boolean {
    csfState.iframeConfigCount += 1;

    if (window._b$dl)
        console.log('### handleIframeConfigFeedback::csfState.iframeConfigCount:: ', csfState.iframeConfigCount, 'who=', pFeedbackObj.fieldType);

    if (!csfState.isConfigured) {
        if (csfState.iframeConfigCount === csfState.originalNumIframes) {
            if (process.env.NODE_ENV === 'development' && window._b$dl) {
                console.log('\n### handleIframeConfigFeedback::handleIframeConfigFeedback:: ALL IFRAMES CONFIG DO CALLBACK type=', csfState.type);
            }

            // Announce we're configured to the rest of the system
            isConfigured();

            return true;
        }
    } else {
        const callbackObj: CbObjOnAdditionalSF = { additionalIframeConfigured: true, fieldType: pFeedbackObj.fieldType, type: csfState.type };
        csfCallbacks.onAdditionalSFConfig(callbackObj);
    }

    return false;
}
