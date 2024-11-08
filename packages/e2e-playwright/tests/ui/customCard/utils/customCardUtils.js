/**
 * These utils provide a 'friendly' wrapper around the more generic functions in commonUtils
 * - prefilling the iframe selector, an iframe index and the iframe input element selector
 *
 * Unique to each component are where the iframes are to be found,
 * the indices by which a specific iframe can be identified,
 * and the selectors for elements found within it.
 *
 * A custom card can shares the 3 iframes from a regular card (see cardUtils.js),
 * but it can also have separate date fields meaning, as well as the cardNumber, iframes with the index and id:
 * 1 - encryptedExpiryMonth
 * 2 - encryptedExpiryYear
 * 3 - encryptedSecurityCode
 */

// Return a set of functions that will work for a particular iframe set up
// - iframeSelector dictates how the iframe is to be found within the DOM for this particular set of tests
export default iframeSelector => {
    return {
        fillMonth: fillMonth(iframeSelector),
        fillYear: fillYear(iframeSelector),
        fillCVC: fillCVC(iframeSelector),
        deleteMonth: deleteMonth(iframeSelector),
        deleteYear: deleteYear(iframeSelector)
    };
};

/**
 * @param t - TestController ref
 * @param value - text to enter into selected element in iframe
 * @param replace - boolean: whether typed text will replace existing content
 * @returns {Promise<*>}
 */
const fillMonth = iframeSelector => {
    return async (t, value, action) => {
        return fillIFrame(t, iframeSelector, 1, getInputSelector('encryptedExpiryMonth'), value, action);
    };
};

const deleteMonth = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 1, getInputSelector('encryptedExpiryMonth'));
    };
};

const fillYear = iframeSelector => {
    return async (t, value, action) => {
        return fillIFrame(t, iframeSelector, 2, getInputSelector('encryptedExpiryYear'), value, action);
    };
};

const deleteYear = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 2, getInputSelector('encryptedExpiryYear'));
    };
};

const fillCVC = iframeSelector => {
    return async (t, value, action) => {
        return fillIFrame(t, iframeSelector, 3, getInputSelector('encryptedSecurityCode'), value, action);
    };
};
