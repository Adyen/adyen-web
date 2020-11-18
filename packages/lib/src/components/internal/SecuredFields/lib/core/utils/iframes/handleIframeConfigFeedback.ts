// Count how many iframes have successfully been configured and, if its all of them, call callback function

import { CbObjOnAdditionalSF } from '../../../types';

export function handleIframeConfigFeedback(pFeedbackObj): boolean {
    this.state.iframeConfigCount += 1;

    if (!this.state.isConfigured) {
        if (process.env.NODE_ENV === 'development' && window._b$dl) {
            console.log('\n### handleIframeConfigFeedback:: this.state.type=', this.state.type);
            console.log('### handleIframeConfigFeedback:: pFeedbackObj=', pFeedbackObj);
            console.log('### handleIframeConfigFeedback:: this.state.iframeConfigCount=', this.state.iframeConfigCount);
            console.log('### handleIframeConfigFeedback:: this.state.originalNumIframes=', this.state.originalNumIframes);
        }

        if (this.state.iframeConfigCount === this.state.originalNumIframes) {
            if (process.env.NODE_ENV === 'development' && window._b$dl) {
                console.log('\n### handleIframeConfigFeedback::handleIframeConfigFeedback:: ALL IFRAMES CONFIG DO CALLBACK type=', this.state.type);
            }

            // Announce we're configured to the rest of the system
            this.isConfigured();

            return true;
        }
    } else {
        if (process.env.NODE_ENV === 'development' && window._b$dl) {
            console.log('### handleIframeConfigFeedback:: State is already configured so MUST BE ADDING IFRAMES');
            console.log('### handleIframeConfigFeedback:: this.state.iframeConfigCount=', this.state.iframeConfigCount);
            console.log('### handleIframeConfigFeedback:: this.state.originalNumIframes=', this.state.originalNumIframes);
            console.log('### handleIframeConfigFeedback:: current this.state.numIframes=', this.state.numIframes);
            console.log('### handleIframeConfigFeedback:: pFeedbackObj=', pFeedbackObj);
        }

        const callbackObj: CbObjOnAdditionalSF = { additionalIframeConfigured: true, fieldType: pFeedbackObj.fieldType, type: this.state.type };
        this.callbacks.onAdditionalSFConfig(callbackObj);
    }

    return false;
}
