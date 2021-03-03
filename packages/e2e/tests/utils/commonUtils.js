import { ClientFunction, Selector } from 'testcafe';

export const getIframeSelector = (selectorStr, timeout = 20000) => {
    return Selector(selectorStr, { timeout });
};

export const start = async (t, wait = 1000, speed = 1) => {
    return t.wait(wait).setTestSpeed(speed);
};

export const fillIFrame = async (t, iframeSelector, iFrameNum, iFrameInputSelector, value, replace = false, paste = false) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .typeText(iFrameInputSelector, value, { replace, paste })
        .switchToMainWindow();
};

export const deleteFromIFrame = async (t, iframeSelector, iFrameNum, iFrameInputSelector) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .selectText(iFrameInputSelector)
        .pressKey('delete')
        .switchToMainWindow();
};

export const checkIframeContainsValue = async (t, iframeSelector, iFrameNum, iFrameInputSelector, valueToCheck) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .expect(Selector(iFrameInputSelector).value)
        .contains(valueToCheck);
};

export const getIsValid = ClientFunction((who = 'card') => {
    return window[who].isValid;
});

export const getFromWindow = ClientFunction((what, prop) => {
    if (!prop) {
        return window[what];
    }
    return window[what][prop];
});
