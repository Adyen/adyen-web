import { fillIFrame, getIframeSelector } from '../../utils/commonUtils';

const iframeSelector = getIframeSelector('.adyen-checkout__threeds2__challenge iframe');

export const fillChallengeField = async (t, value = 'password', action) => {
    return fillIFrame(t, iframeSelector, 0, '.input-field', value, action);
};

export const submitChallenge = async t => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(0))
        .click('[type="submit"]')
        .switchToMainWindow();
};
