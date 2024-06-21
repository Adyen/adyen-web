export const on = (node, event, callback, useCapture?) => {
    try {
        if (node && typeof node.addEventListener === 'function') {
            node.addEventListener(event, callback, useCapture);
        }
    } catch (_) {
        // fail silently
    }
};

export const off = (node, event, callback, useCapture?) => {
    try {
        if (node && typeof node.addEventListener === 'function') {
            node.removeEventListener(event, callback, useCapture);
        }
    } catch (_) {
        // fail silently
    }
};
