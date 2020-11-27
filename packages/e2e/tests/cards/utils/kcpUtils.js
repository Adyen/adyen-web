import { setIframeSelector, fillIFrame, checkIframeContainsValue } from '../../utils/commonUtils';

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

// Set Selector that says where the iframes are to be found for this component
setIframeSelector('.card-field iframe');

/**
 * @param t - TestController ref
 * @param value - text to enter into selected element in iframe
 * @param replace - boolean: whether typed text will replace existing content
 * @returns {Promise<*>}
 */
export const fillPwd = async (t, value = TEST_PWD_VALUE, replace = false) => {
    return fillIFrame(t, 3, '#encryptedPassword', value, replace);
};

export const checkPwd = async (t, value) => {
    return checkIframeContainsValue(t, 3, '.js-iframe-input', value);
};

export const fillTaxNumber = async (t, taxValue = TEST_TAX_NUMBER_VALUE) => {
    return t.switchToMainWindow().typeText('.adyen-checkout__card__kcp-taxNumber__input', taxValue);
};
