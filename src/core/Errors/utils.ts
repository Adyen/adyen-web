import { ERROR_CODES, ERROR_MSG_INVALID_FIELD } from './constants';
import Language from '../../language/Language';
import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE
} from '../../components/internal/SecuredFields/lib/configuration/constants';

/**
 * Access items stored in the ERROR_CODES object by either sending in the key - in which case you get the value
 * or by sending in the value - in which case you get the key
 * @param keyOrValue - key (or value) by which to retrieve the corresponding value (or key)
 */
export const getError = (keyOrValue: string): string => {
    // Retrieve value
    let rtnVal = ERROR_CODES[keyOrValue];
    if (rtnVal) return rtnVal;

    // Retrieve key
    rtnVal = Object.keys(ERROR_CODES).find(key => ERROR_CODES[key] === keyOrValue);
    if (rtnVal) return rtnVal;

    // Neither exist
    return keyOrValue;
};

export const getDefaultErrorCode = fieldType => {
    switch (fieldType) {
        case ENCRYPTED_CARD_NUMBER:
            return 'creditCard.numberField.invalid';
        case ENCRYPTED_EXPIRY_DATE:
            return 'creditCard.expiryDateField.invalid';
        case ENCRYPTED_EXPIRY_MONTH:
            return 'creditCard.expiryDateField.invalid';
        case ENCRYPTED_EXPIRY_YEAR:
            return 'creditCard.expiryDateField.invalid';
        case ENCRYPTED_SECURITY_CODE:
            return 'creditCard.oneClickVerification.invalidInput.title';
        default:
            return getError(ERROR_MSG_INVALID_FIELD);
    }
};

/**
 * If error translation exists then error (code) is usable, else return a default error code
 * @param error -
 * @param i18n -
 */
export const getVerifiedErrorCode = (fieldType: string, error: string, i18n: Language): string => {
    // Empty string is a error being cleared - so do nothing;
    if (error === '') return error;
    const translatedError = i18n.get(error);
    // If translatedError still equals error then i18n didn't find a translation - so get a default code
    return translatedError === error ? getDefaultErrorCode(fieldType) : error;
};

export const addAriaErrorTranslationsObject = i18n => {
    const errorKeys = Object.keys(ERROR_CODES);

    const transObj = errorKeys.reduce((acc, item) => {
        const value = ERROR_CODES[item];
        // Limit to sf related errors
        if (value.indexOf('sf-') > -1 || value.indexOf('gen.01') > -1) {
            acc[value] = i18n.get(value);
        }
        return acc;
    }, {});

    // console.log('### utils::addAriaErrorTranslationsObject:: transObj', transObj);

    return transObj;
};

/**
 * Adds a new error property to an object, unless it already exists.
 * This error property is an object containing the translated errors, stored by code, that relate to the securedFields
 * @param originalObject - object we want to duplicate and enhance
 * @param i18n - an i18n object to use to get translations
 * @returns a duplicate of the original object with a new property: "error" whose value is a object containing the translated errors
 */
export const addErrorTranslationsToObject = (originalObj, i18n) => {
    const nuObj = { ...originalObj };
    nuObj.error = !nuObj.error ? addAriaErrorTranslationsObject(i18n) : nuObj.error;
    return nuObj;
};
