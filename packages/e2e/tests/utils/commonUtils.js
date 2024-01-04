import { ClientFunction, Selector, t } from 'testcafe';

export const removeFocusFromElement = async selector => {
    await t.dispatchEvent(selector, 'blur');
};

export const removeCharsFromInput = async (selector, numOfChars = 0) => {
    await t.click(selector);
    for (let i = 0; i < numOfChars; i++) {
        await t.pressKey('backspace');
    }
};

export const getInputSelector = (fieldType, withSelector = false) => {
    const selStr = `[data-fieldtype="${fieldType}"]`;
    return withSelector ? Selector(selStr) : selStr;
};

export const getAriaErrorField = (fieldType, withSelector = false) => {
    const selStr = `#${fieldType}-ariaContext`;
    return withSelector ? Selector(selStr) : selStr;
};

export const getIframeSelector = (selectorStr, timeout = 20000) => {
    return Selector(selectorStr, { timeout });
};

export const start = async (t, wait = 1000, speed = 1) => {
    return t.wait(wait).setTestSpeed(speed);
};

export const fillIFrame = async (t, iframeSelector, iFrameNum, iFrameInputSelector, value, action = 'add') => {
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

export const deleteDigitsFromIFrame = async (t, iframeSelector, iFrameNum, iFrameInputSelector, startCaretPos, endCaretPos) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .selectText(iFrameInputSelector, startCaretPos, endCaretPos)
        .pressKey('delete')
        .switchToMainWindow();
};

export const checkIframeInputContainsValue = async (t, iframeSelector, iFrameNum, iFrameInputSelector, valueToCheck) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .expect(Selector(iFrameInputSelector).value)
        .contains(valueToCheck);
};

export const checkIframeForAttributeValue = async (t, iframeSelector, iFrameNum, iFrameInputSelector, inputAttr, valueToCheck) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .expect(Selector(iFrameInputSelector).getAttribute(inputAttr))
        .eql(valueToCheck)
        .switchToMainWindow();
};

export const checkIframeElHasExactText = async (t, iframeSelector, iFrameNum, iFrameElSelector, textValue) => {
    return t
        .switchToMainWindow()
        .switchToIframe(iframeSelector.nth(iFrameNum))
        .expect(Selector(iFrameElSelector).withExactText(textValue).exists)
        .ok()
        .switchToMainWindow();
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
