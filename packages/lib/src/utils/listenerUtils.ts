export const on = (node: HTMLElement, event, callback, useCapture: boolean = false) => {
    if (node && typeof node.addEventListener === 'function') {
        node.addEventListener(event, callback, useCapture);
        return true;
    }
    return false;
};

export const off = (node: HTMLElement, event, callback, useCapture: boolean = false) => {
    if (node && typeof node.removeEventListener === 'function') {
        node.removeEventListener(event, callback, useCapture);
        return true;
    }
    return false;
};
