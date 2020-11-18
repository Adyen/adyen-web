import { setIframeSelector, fillIFrame, deleteFromIFrame } from '../commonUtils';

import { REGULAR_TEST_CARD, TEST_DATE_VALUE, TEST_CVC_VALUE } from '../constants';

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

// Set Selector that says where the iframes are to be found for this component
setIframeSelector('.card-field iframe');

/**
 * @param t - TestController ref
 * @param value - text to enter into selected element in iframe
 * @param replace - boolean: whether typed text will replace existing content
 * @returns {Promise<*>}
 */
export const fillCardNumber = async (t, value = REGULAR_TEST_CARD, replace = false) => {
    return fillIFrame(t, 0, '#encryptedCardNumber', value, replace);
};

export const deleteCardNumber = async t => {
    return deleteFromIFrame(t, 0, '#encryptedCardNumber');
};

export const fillDate = async (t, value = TEST_DATE_VALUE, replace = false) => {
    return fillIFrame(t, 1, '#encryptedExpiryDate', value, replace);
};

export const fillCVC = async (t, value = TEST_CVC_VALUE, replace = false) => {
    return fillIFrame(t, 2, '#encryptedSecurityCode', value, replace);
};

export const fillDateAndCVC = async (t, dateValue = TEST_DATE_VALUE, cvcValue = TEST_CVC_VALUE) => {
    await fillDate(t, dateValue);
    return fillCVC(t, cvcValue);
};
