import { ERROR_CODES } from './constants';

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
    return null;
};

export const addAriaErrorTranslationsObject = i18n => {
    const errorKeys = Object.keys(ERROR_CODES);

    const transObj = errorKeys.reduce((acc, item) => {
        const value = ERROR_CODES[item];
        // Limit to sf related errors
        if (value.indexOf('sf-') > -1 || value.indexOf('gen.01') > -1) {
            // acc[`"${value}"`] = i18n.get(value);
            acc[value] = i18n.get(value);
        }
        return acc;
    }, {});

    // console.log('### utils::addAriaErrorTranslationsObject:: transObj', transObj);

    return transObj;
};

/**
 * Adds a new error property to an object, unless it already exists.
 * This error property is an object containing the translated errors, stored by code, that related to the securedFields
 * @param originalObject - object we want to duplicate and enhance
 * @param key - fieldID eg. "encryptedCardNumber", id under which we expect a translation to exist
 * @param i18n - an i18n object to use to get translations
 * @param fieldNamesList - list of keys (fieldIDs) we want to add translations for
 * @returns a duplicate of the original object with a new property: "error" whose value is a object containing the translated errors
 */
export const addErrorTranslationsToObject = (originalObj, key, i18n, fieldNamesList) => {
    if (fieldNamesList.includes(key)) {
        const nuObj = { ...originalObj };
        nuObj.error = !nuObj.error ? addAriaErrorTranslationsObject(i18n) : nuObj.error;
        return nuObj;
    }
    return originalObj;
};
