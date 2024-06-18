export const on = (node, event, callback, useCapture?) => {
    if (typeof node.addEventListener === 'function') {
        node.addEventListener(event, callback, useCapture);
        return;
    }

    throw new Error(`: Unable to bind ${event}-event`);
};

export const off = (node, event, callback, useCapture?) => {
    if (typeof node.addEventListener === 'function') {
        node.removeEventListener(event, callback, useCapture);
        return;
    }

    throw new Error(`: Unable to unbind ${event}-event`);
};
