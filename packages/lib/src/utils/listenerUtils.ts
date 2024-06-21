export const on = (node, event, callback, useCapture?) => {
    if (node && typeof node.addEventListener === 'function') {
        node.addEventListener(event, callback, useCapture);
        return true;
    }
    return false;
};

export const off = (node, event, callback, useCapture?) => {
    if (node && typeof node.removeEventListener === 'function') {
        node.removeEventListener(event, callback, useCapture);
        return true;
    }
    return false;
};
