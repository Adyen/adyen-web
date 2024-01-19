import { selectOne, select } from '../../../utilities/dom';

const getPreviousTabbableEl = (matchEl, getPrevious = true) => {
    const selStr =
        '*[data-cse], a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), ' +
        'button:not([disabled]), object, embed, *[tabindex], *[contenteditable]';
    const allPotentialTabEls = Array.prototype.slice.call(select(document, selStr));
    const actualTabEls = [];

    allPotentialTabEls.forEach(potentialTabEl => {
        const tabIndex = potentialTabEl.getAttribute('tabindex');
        const isValidTabEl = !tabIndex || parseInt(tabIndex, 10) >= 0; // If tabindex hasn't been set, or is set and is >= 0
        const bounds = potentialTabEl.getBoundingClientRect();
        const hasDimensions = bounds.width > 0 && bounds.height > 0;

        if (isValidTabEl && hasDimensions) {
            actualTabEls.push(potentialTabEl);
        }
    });

    // Loop through an array until it finds an element based on a test fn, and then return the elements index
    const getIndexThruTest = (arr, testFn) => {
        for (let n = 0; n < arr.length; n += 1) {
            if (testFn(arr[n])) {
                return n;
            }
        }
        return -1;
    };

    // Test function
    const isElOrContainsEl = tabEl => tabEl === matchEl || matchEl.contains(tabEl);

    // Loop through the actualTabEls array until it finds the matchEl, returning its index
    const matchElIndex = getIndexThruTest(actualTabEls, isElOrContainsEl);

    // Are we actually getting the previous element OR the next?
    const indexModifier = getPrevious ? -1 : 1;

    return actualTabEls[matchElIndex + indexModifier];
};

export const getPreviousTabbableNonSFElement = (passedFieldType, rootNode, getPrevious?) => {
    // --
    const sfEl = selectOne(rootNode, `[data-cse=${passedFieldType}]`);
    return getPreviousTabbableEl(sfEl, getPrevious);
};

export const focusExternalField = (pAdditionalField: HTMLElement): void => {
    if (pAdditionalField) {
        pAdditionalField.focus();

        // Quirky! - Needed to work in the Components scenario
        pAdditionalField.blur();
        pAdditionalField.focus();
    }
};
