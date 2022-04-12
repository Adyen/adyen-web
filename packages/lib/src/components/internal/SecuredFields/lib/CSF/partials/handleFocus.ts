import { SFFeedbackObj, CbObjOnFocus } from '../../types';
import ua from '../utils/userAgent';

/**
 * Call focus callback and store which field currently has focus
 *
 * @param csfState - comes from initial, partial, implementation
 * @param csfProps - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 *
 * @param pFeedbackObj -
 */
export function handleFocus({ csfState, csfProps, csfCallbacks }, pFeedbackObj: SFFeedbackObj): void {
    const feedbackObj: SFFeedbackObj = { ...pFeedbackObj };

    delete feedbackObj.numKey;

    feedbackObj.rootNode = csfProps.rootNode;
    feedbackObj.type = csfState.type;

    // Store which field has focus
    const focusString: string = feedbackObj.fieldType;

    // FOCUS EVENT - store who has focus, if it differs to the current value
    if (feedbackObj.focus) {
        if (csfState.currentFocusObject !== focusString) {
            csfState.currentFocusObject = focusString;

            // If iOS detected AND we don't have a (touchend) listener
            if (ua.__IS_IOS && !csfState.registerFieldForIos) {
                this.handleAdditionalFields();
            }
        }
    } else {
        // BLUR EVENT - remove stored focus
        const focusObjectMatches: boolean = csfState.currentFocusObject === focusString;
        if (focusObjectMatches) {
            csfState.currentFocusObject = null;
        }
    }

    // Call callback (SecuredFieldsProviderHandlers > onFocus)
    const callbackObj: CbObjOnFocus = feedbackObj as CbObjOnFocus;
    callbackObj.currentFocusObject = csfState.currentFocusObject;
    csfCallbacks.onFocus(callbackObj);
}
