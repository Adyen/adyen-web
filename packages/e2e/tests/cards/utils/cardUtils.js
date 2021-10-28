import { getInputSelector, fillIFrame, deleteFromIFrame, deleteDigitsFromIFrame, checkIframeForAttributeValue } from '../../utils/commonUtils';
import { REGULAR_TEST_CARD, TEST_DATE_VALUE, TEST_CVC_VALUE } from './constants';

/**
 * These utils provide a 'friendly' wrapper around the more generic functions in commonUtils
 * - prefilling the iframe selector, an iframe index and the iframe input element selector
 *
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
        deleteDate: deleteDate(iframeSelector),
        deleteCVC: deleteCVC(iframeSelector),
        fillDate: fillDate(iframeSelector),
        fillCVC: fillCVC(iframeSelector),
        fillDateAndCVC: fillDateAndCVC(iframeSelector),
        deleteDigitsFromCardNumber: deleteDigitsFromCardNumber(iframeSelector),
        // More generic function (need to specify index and fieldType
        checkIframeForAttrVal: checkIframeForAttrVal(iframeSelector)
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
        return fillIFrame(t, iframeSelector, 0, getInputSelector('encryptedCardNumber'), value, action);
    };
};

const deleteCardNumber = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 0, getInputSelector('encryptedCardNumber'));
    };
};

const deleteDigitsFromCardNumber = iframeSelector => {
    return async (t, startCaretPos, endCaretPos) => {
        return deleteDigitsFromIFrame(t, iframeSelector, 0, getInputSelector('encryptedCardNumber'), startCaretPos, endCaretPos);
    };
};

const deleteDate = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 1, getInputSelector('encryptedExpiryDate'));
    };
};

const deleteCVC = iframeSelector => {
    return async t => {
        return deleteFromIFrame(t, iframeSelector, 2, getInputSelector('encryptedSecurityCode'));
    };
};

const fillDate = iframeSelector => {
    return async (t, value = TEST_DATE_VALUE, action) => {
        return fillIFrame(t, iframeSelector, 1, getInputSelector('encryptedExpiryDate'), value, action);
    };
};

const fillCVC = iframeSelector => {
    return async (t, value = TEST_CVC_VALUE, action, iFrameNum = 2) => {
        return fillIFrame(t, iframeSelector, iFrameNum, getInputSelector('encryptedSecurityCode'), value, action);
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

/**
 * @usage cardPage.cardUtils.checkIframeForAttrVal(t, 1, 'encryptedExpiryDate', 'aria-required', 'true');
 * Will check input in expiryDate iframe for an 'aria-required' attr with a value 'true'
 */
const checkIframeForAttrVal = iframeSelector => {
    return async (t, index, fieldType, attr, value) => {
        return checkIframeForAttributeValue(t, iframeSelector, index, getInputSelector(fieldType), attr, value);
    };
};
