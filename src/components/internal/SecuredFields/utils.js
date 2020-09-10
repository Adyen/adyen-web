import getProp from '../../../utils/getProp';
import { getImageUrl } from '../../../utils/get-image';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_PWD_FIELD
} from './lib/configuration/constants';
import { DEFAULT_ERROR } from '../../../core/Errors/constants';

// ROUTINES USED IN SecuredFieldsProvider.componentDidMount TO DETECT & MAP FIELD NAMES ///////////
/**
 * Make an array of encrypted field names based on the value of the 'data-cse' attribute of elements in the rootNode
 */
export const getFields = rootNode => {
    if (rootNode) {
        return Array.prototype.slice.call(rootNode.querySelectorAll('[data-cse*="encrypted"]')).map(f => f.getAttribute('data-cse'));
    }
    return [];
};

/**
 * If, visually, we're dealing with a single date field (expiryDate) we still need separate entries
 * for expiryMonth & expiryYear - since that is how the values will be delivered from securedFields
 */
export const validFieldsReducer = (acc, cur) => {
    if (cur === ENCRYPTED_EXPIRY_DATE) {
        acc[ENCRYPTED_EXPIRY_MONTH] = false;
        acc[ENCRYPTED_EXPIRY_YEAR] = false;
    } else {
        acc[cur] = false;
    }

    return acc;
};
// -- end ROUTINES USED IN SecuredFieldsProvider.componentDidMount --------------------------------

// ROUTINES USED IN SecuredFieldsProvider.showValidation TO GENERATE ERRORS ///////////
/**
 *  If, visually, we're dealing with a single date field (expiryDate) remap the separate entries we have
 *  for the valid states of expiryMonth & expiryYear back to the single key we use to an store an error
 *  i.e `"encryptedExpiryMonth" & "encryptedExpiryYear" => "encryptedExpiryDate"`
 */
const mapDateFields = (field, numDateFields) => {
    const isDateField = field === ENCRYPTED_EXPIRY_MONTH || field === ENCRYPTED_EXPIRY_YEAR;
    return numDateFields === 1 && isDateField ? ENCRYPTED_EXPIRY_DATE : field;
};

/**
 * Skip generating an error for an optional CVC field, unless it is already in error
 */
const mapCVCField = (field, state) => {
    const isCvcField = field === ENCRYPTED_SECURITY_CODE;
    const isCvcFieldValid = !state.errors[ENCRYPTED_SECURITY_CODE];
    return !state.cvcRequired && isCvcFieldValid && isCvcField ? null : field;
};

export const getErrorReducer = (numDateFields, state) => (acc, field) => {
    // We're only interested in the non-valid fields from the state.valid object...
    let val =
        state.valid[field] !== true
            ? mapDateFields(field, numDateFields) // Map the keys we use for the valid state to the key(s) we use for the error state
            : null;

    // Skip error generation for optional CVC unless field is already in error
    val = mapCVCField(val, state);

    if (val && !acc.includes(val)) acc.push(val);

    return acc;
};

/**
 * Create an object suitable for sending to our handleOnError function
 */
export const getErrorObject = (fieldType, rootNode, state) => {
    const error = getProp(state, `errors.${fieldType}`) || DEFAULT_ERROR;

    return {
        rootNode,
        fieldType,
        error,
        type: 'card'
    };
};
// -- end ROUTINES USED IN SecuredFieldsProvider.showValidation -----------------------

export const resolvePlaceholders = (i18n = {}) => ({
    [ENCRYPTED_CARD_NUMBER]: i18n.get && i18n.get('creditCard.numberField.placeholder'),
    [ENCRYPTED_EXPIRY_DATE]: i18n.get && i18n.get('creditCard.expiryDateField.placeholder'),
    [ENCRYPTED_SECURITY_CODE]: i18n.get && i18n.get('creditCard.cvcField.placeholder'),
    [ENCRYPTED_PWD_FIELD]: i18n.get && i18n.get('creditCard.encryptedPassword.placeholder')
});

/**
 * Used by SecuredFieldsProviderHandlers
 */
export const getCardImageUrl = (brand, loadingContext) => {
    const type = brand === 'card' ? 'nocard' : brand || 'nocard';

    const imageOptions = {
        type,
        extension: 'svg',
        loadingContext
    };

    return getImageUrl(imageOptions)(type);
};

// REGULAR "UTIL" UTILS
/**
 * Checks if `prop` is classified as an `Array` primitive or object.
 * @internal
 * @param prop - The value to check.
 * @returns Returns `true` if `prop` is correctly classified, else `false`.
 * @example
 * ```
 * isArray([1, 2, 3]);
 * // => true
 *
 * isArray(1);
 * // => false
 * ```
 */
export function isArray(prop) {
    return typeof prop === 'object' && prop !== null && Object.prototype.toString.call(prop) === '[object Array]';
}

/**
 * 'Destructures' properties from object, returns a new object only containing those properties that were asked for
 *
 * @param args - property names to select: can be either 'regular' arguments (commma separated list) or an array
 * @returns - an object with a function 'from' that accepts a single argument - the object from which to choose properties.
 * This function returns a new object - a copy of the original but only including the desired properties
 *
 * @example const strippedObj = pick('cardType', 'securityCode').from(cardObject);
 * @example const strippedObj = pick(['cardType', 'securityCode']).from(cardObject);
 */
export function pick(...args) {
    const myArgs = isArray(args[0]) ? args[0] : args;

    return {
        from: obj => {
            // eslint-disable-line

            return myArgs
                .map(k => (k in obj ? { [k]: obj[k] } : {})) // eslint-disable-line
                .reduce((res, o) => ({ ...res, ...o }), {});
        }
    };
}

/**
 *'Destructures' properties from object, returning a new object containing all the original objects properties except those that were specifically rejected
 *
 * @param args - property names to reject: can be either 'regular' arguments (commma separated list) or an array
 * @returns - an object with a function 'from' that accepts a single argument - the object from which to reject properties.
 * This function returns a new object - a copy of the original but excluding the selected properties
 *
 * @example const strippedObj = reject('permittedLengths', 'pattern', 'startingRules').from(cardObject);
 * @example const strippedObj = reject(['permittedLengths', 'pattern', 'startingRules']).from(cardObject);
 */
export function reject(...args) {
    const myArgs = isArray(args[0]) ? args[0] : args;

    return {
        from: obj => {
            const vkeys = Object.keys(obj).filter(k => !myArgs.includes(k));

            return pick(...vkeys).from(obj);
        }
    };
}
