import { fillIFrame, checkIframeContainsValue } from '../../utils/commonUtils';

import { TEST_PWD_VALUE, TEST_TAX_NUMBER_VALUE } from './constants';

/**
 * Unique to each component are where the iframes are to be found,
 * the indices by which a specific iframe can be identified,
 * and the selectors for elements found within it.
 *
 * A KCP card shares the 3 iframes from a regular card (see cardUtils.js),
 * plus a taxNumber field,
 * plus an iframe with the index and id:
 * 3 - encryptedPassword
 */

// Return a set of functions that will work for a particular iframe set up
// - iframeSelector dictates how the iframe is to be found within the DOM for this particular set of tests
export default iframeSelector => {
    return {
        fillPwd: fillPwd(iframeSelector),
        checkPwd: checkPwd(iframeSelector),
        fillTaxNumber: fillTaxNumber
    };
};

/**
 * @param t - TestController ref
 * @param value - text to enter into selected element in iframe
 * @param replace - boolean: whether typed text will replace existing content
 * @returns {Promise<*>}
 */
const fillPwd = iframeSelector => {
    return async (t, value = TEST_PWD_VALUE, replace = false) => {
        return fillIFrame(t, iframeSelector, 3, '#encryptedPassword', value, replace);
    };
};

const checkPwd = iframeSelector => {
    return async (t, value) => {
        return checkIframeContainsValue(t, iframeSelector, 3, '.js-iframe-input', value);
    };
};

const fillTaxNumber = async (t, taxValue = TEST_TAX_NUMBER_VALUE) => {
    return t.switchToMainWindow().typeText('.adyen-checkout__card__kcp-taxNumber__input', taxValue);
};
