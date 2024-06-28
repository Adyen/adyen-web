const select = (root, selector) => {
    let array = [];

    if (root) {
        // Convert NodeList to array
        if (typeof root.querySelectorAll === 'function') {
            array = [].slice.call(root.querySelectorAll(selector));
        }
    }

    return array;
};

const selectOne = (root, selector) => {
    if (!root) {
        return undefined;
    }

    return root.querySelector(selector);
};

const getAttribute = (node, attribute) => {
    if (!node) {
        return undefined;
    }
    return node.getAttribute(attribute);
};

/**
 * @internal
 * Removes all children elements of the given node.
 *
 * @param node -
 */
const removeAllChildren = node => {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
};

export { getAttribute, select, selectOne, removeAllChildren };
