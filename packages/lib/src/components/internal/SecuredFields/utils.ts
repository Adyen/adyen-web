import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE_3_DIGITS,
    ENCRYPTED_SECURITY_CODE_4_DIGITS,
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD
} from './lib/configuration/constants';
import { SFPlaceholdersObject } from './lib/securedField/AbstractSecuredField';
import { Resources } from '../../../core/Context/Resources';

/**
 * Lookup translated values for the placeholders for the SecuredFields
 * and return an object with these mapped to the data-cse value of the SecuredField
 */
// todo: remove?
export const resolvePlaceholders = (): SFPlaceholdersObject => {
    const phObj = {
        [ENCRYPTED_CARD_NUMBER]: '',
        [ENCRYPTED_EXPIRY_DATE]: '',
        [ENCRYPTED_EXPIRY_MONTH]: '',
        [ENCRYPTED_EXPIRY_YEAR]: '',
        [ENCRYPTED_SECURITY_CODE]: '', // Used for gift cards
        [ENCRYPTED_SECURITY_CODE_3_DIGITS]: '',
        [ENCRYPTED_SECURITY_CODE_4_DIGITS]: '',
        [ENCRYPTED_PWD_FIELD]: '',
        [ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]: '',
        [ENCRYPTED_BANK_LOCATION_FIELD]: ''
    };

    // For ach - if the merchant has specified a placeholder (which can only be done through a translations object, it doesn't exist in the translations files)
    // then use it... else default to nothing
    if (phObj[ENCRYPTED_BANK_ACCNT_NUMBER_FIELD] === 'ach.accountNumberField.placeholder') {
        phObj[ENCRYPTED_BANK_ACCNT_NUMBER_FIELD] = '';
    }
    if (phObj[ENCRYPTED_BANK_LOCATION_FIELD] === 'ach.accountLocationId.placeholder') {
        phObj[ENCRYPTED_BANK_LOCATION_FIELD] = '';
    }

    return phObj;
};

/**
 * Used by SecuredFieldsProviderHandlers
 */
export const getCardImageUrl = (brand, resources: Resources) => {
    const type = brand === 'card' ? 'nocard' : brand || 'nocard';

    const imageOptions = {
        type,
        extension: 'svg'
    };

    return resources.getImage(imageOptions)(type);
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
 * 'Destructures' properties from object - returns a new object only containing those properties that were asked for (including if those properties
 * have values that are falsy: null, undefined, false, '').
 *
 * @param args - property names to select: can be either 'regular' arguments (comma separated list) or an array
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
 * @param args - property names to reject: can be either 'regular' arguments (comma separated list) or an array
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
