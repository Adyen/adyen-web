import * as logger from '../../../utilities/logger';

// Count how many iframes have successfully been configured and, if its all of them, call callback function
export function handleIframeConfigFeedback(): boolean {
    this.state.iframeConfigCount += 1;

    if (process.env.NODE_ENV === 'development' && window._b$dl) {
        logger.log('\n### handleIframeConfigFeedback::handleIframeConfigFeedback:: this.state.type=', this.state.type);
        logger.log('### handleIframeConfigFeedback::handleIframeConfigFeedback:: this.state.iframeConfigCount=', this.state.iframeConfigCount);
        logger.log('### handleIframeConfigFeedback::handleIframeConfigFeedback:: this.state.numIframes=', this.state.numIframes);
    }

    if (this.state.iframeConfigCount === this.state.numIframes) {
        if (process.env.NODE_ENV === 'development' && window._b$dl) {
            logger.log('\n### handleIframeConfigFeedback::handleIframeConfigFeedback:: ALL IFRAMES CONFIG DO CALLBACK type=', this.state.type);
        }

        // Announce we're configured to the rest of the system
        this.isConfigured();

        return true;
    }
    return false;
}
