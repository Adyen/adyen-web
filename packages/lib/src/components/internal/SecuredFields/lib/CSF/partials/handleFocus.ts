import { SFFeedbackObj, CbObjOnFocus } from '../../types';

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

    // Focus event - store, if this isn't the field that already has focus
    if (feedbackObj.focus) {
        if (csfState.currentFocusObject !== focusString) {
            csfState.currentFocusObject = focusString;

            // iOS ONLY thing (fn returns if not iOS)
            if (!csfState.registerFieldForIos) {
                this.handleAdditionalFields();
            }
        }
    } else {
        // Blur event - remove stored focus
        const focusObjectMatches: boolean = csfState.currentFocusObject === focusString;
        if (focusObjectMatches) {
            csfState.currentFocusObject = null;
        }
    }

    // Call callback
    const callbackObj: CbObjOnFocus = feedbackObj as CbObjOnFocus;
    callbackObj.currentFocusObject = csfState.currentFocusObject;
    csfCallbacks.onFocus(callbackObj);
}
