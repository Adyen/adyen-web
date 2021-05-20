import { fillIFrame, deleteFromIFrame, deleteDigitsFromIFrame } from '../../utils/commonUtils';
import { REGULAR_TEST_CARD, TEST_DATE_VALUE, TEST_CVC_VALUE } from './constants';

/**
 * Unique to each component are where the iframes are to be found,
 * the indices by which a specific iframe can be identified,
 * and the selectors for elements found within it
 *
 * However most card scenarios have 3 iframes with these indices and ids:
 * 0 - encryptedCardNumber
 * 1 - encryptedExpiryDate
 * 2 - encryptedSecurityCode
 */

// Return a set of functions that will work for a particular iframe set up
// - iframeSelector dictates how the iframe is to be found within the DOM for this particular set of tests
export default iframeSelector => {
    return {
        fillCardNumber: fillCardNumber(iframeSelector),
        deleteCardNumber: deleteCardNumber(iframeSelector),
        deleteCVC: deleteCVC(iframeSelector),
        fillDate: fillDate(iframeSelector),
        fillCVC: fillCVC(iframeSelector),
        fillDateAndCVC: fillDateAndCVC(iframeSelector),
        deleteDigitsFromCardNumber: deleteDigitsFromCardNumber(iframeSelector)
    };
};

/**
 * @param t - TestController ref
 * @param value - text to enter into selected element in iframe
 * @param replace - boolean: whether typed text will replace existing content
 * @returns {Promise<*>}
 */
const fillCardNumber = iframeSelector => {
    return async (t, value = REGULAR_TEST_CARD, action) => {
        return fillIFrame(t, iframeSelector, 0, '#encryptedCardNumber', value, action);
    };
};

const deleteCardNumber = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 0, '#encryptedCardNumber');
    };
};

const deleteDigitsFromCardNumber = iframeSelector => {
    return async (t, startCaretPos, endCaretPos) => {
        return deleteDigitsFromIFrame(t, iframeSelector, 0, '#encryptedCardNumber', startCaretPos, endCaretPos);
    };
};

const deleteCVC = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 2, '#encryptedSecurityCode');
    };
};

const fillDate = iframeSelector => {
    return async (t, value = TEST_DATE_VALUE, action) => {
        return fillIFrame(t, iframeSelector, 1, '#encryptedExpiryDate', value, action);
    };
};

const fillCVC = iframeSelector => {
    return async (t, value = TEST_CVC_VALUE, action) => {
        return fillIFrame(t, iframeSelector, 2, '#encryptedSecurityCode', value, action);
    };
};

const fillDateAndCVC = iframeSelector => {
    const fd = fillDate(iframeSelector);
    const fc = fillCVC(iframeSelector);

    return async (t, dateValue = TEST_DATE_VALUE, cvcValue = TEST_CVC_VALUE) => {
        await fd(t, dateValue);
        return fc(t, cvcValue);
    };
};
