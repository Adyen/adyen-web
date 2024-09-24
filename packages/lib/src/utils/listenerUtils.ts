export const on = (node: Window | HTMLElement | Document, event, callback, useCapture: boolean = false) => {
    if (node && typeof node.addEventListener === 'function') {
        node.addEventListener(event, callback, useCapture);
        return true;
    }
    return false;
};

export const off = (node: Window | HTMLElement | Document, event, callback, useCapture: boolean = false) => {
    if (node && typeof node.removeEventListener === 'function') {
        node.removeEventListener(event, callback, useCapture);
        return true;
    }
    return false;
};
