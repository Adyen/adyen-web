import { SFFeedbackObj, CbObjOnFocus } from '../../../types';

// Call focus callback and store which field currently has focus
export function handleFocus(pFeedbackObj: SFFeedbackObj): void {
    const feedbackObj: SFFeedbackObj = { ...pFeedbackObj };

    delete feedbackObj.numKey;

    feedbackObj.rootNode = this.props.rootNode;
    feedbackObj.type = this.state.type;

    // Store which field has focus
    const focusString: string = feedbackObj.fieldType;

    // Focus event - store, if this isn't the field that already has focus
    if (feedbackObj.focus) {
        if (this.state.currentFocusObject !== focusString) {
            this.state.currentFocusObject = focusString;

            // iOS ONLY thing (fn returns if not iOS)
            if (!this.state.registerFieldForIos) {
                this.handleAdditionalFields();
            }
        }
    } else {
        // Blur event - remove stored focus
        const focusObjectMatches: boolean = this.state.currentFocusObject === focusString;
        if (focusObjectMatches) {
            this.state.currentFocusObject = null;
        }
    }

    // Call callback
    const callbackObj: CbObjOnFocus = feedbackObj as CbObjOnFocus;
    callbackObj.currentFocusObject = this.state.currentFocusObject;
    this.callbacks.onFocus(callbackObj);
}
