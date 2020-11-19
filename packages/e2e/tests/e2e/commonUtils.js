import { Selector } from 'testcafe';

let iframeSelector = Selector('iframe');

export const setIframeSelector = selector => {
    iframeSelector = Selector(selector);
};

export const start = async (t, wait = 1000, speed = 1) => {
    return t.wait(wait).setTestSpeed(speed);
};

export const fillIFrame = async (t, iFrameNum, iFrameInputSelector, value, replace = false) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .typeText(iFrameInputSelector, value, { replace })
        .switchToMainWindow();
};

export const deleteFromIFrame = async (t, iFrameNum, iFrameInputSelector) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .selectText(iFrameInputSelector)
        .pressKey('delete')
        .switchToMainWindow();
};

export const checkIframeContainsValue = async (t, iFrameNum, iFrameInputSelector, valueToCheck) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .expect(Selector(iFrameInputSelector).value)
        .contains(valueToCheck);
};
