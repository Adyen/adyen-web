import { getIframeSelector } from '../../utils/commonUtils';

const iframeSelector = getIframeSelector('.adyen-checkout__threeds2__challenge iframe');

// Added now acs simulator places another iframe inside the iframe that we provide in Components
const iframeSelector2 = getIframeSelector('[name="acsFrame"]');

export const fillChallengeField = async (t, value = 'password', action) => {
    let replace = false;
    let paste = false;
    switch (action) {
        case 'replace':
            replace = true;
            break;
        case 'paste':
            replace = paste = true;
            break;
        default: // 'add'
    }

    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(0))
        .switchToIframe(iframeSelector2.nth(0))
        .typeText('.input-field', value, { replace, paste })
        .switchToMainWindow();
};

export const submitChallenge = async t => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(0))
        .switchToIframe(iframeSelector2.nth(0))
        .click('[type="submit"]')
        .switchToMainWindow();
};
