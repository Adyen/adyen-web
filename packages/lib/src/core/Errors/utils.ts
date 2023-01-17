import { ERROR_CODES } from './constants';
import { SFError } from '../../components/Card/components/CardInput/types';
import { SortErrorsObj, SortedErrorObject } from './types';
import { ValidationRuleResult } from '../../utils/Validator/ValidationRuleResult';

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

/**
 * sortErrorsByLayout - takes a list of errors and a layout, and returns a sorted array of error objects with translated error messages
 *
 * @param errors - an object containing errors, referenced by field type
 * @param layout - a string[] controlling how the output error objects will be ordered
 * @param i18n - our internal Language mechanism
 * @param countrySpecificLabels - some errors are region specific, e.g. in the US "postal code" = "zip code", so map the fieldType value accordingly (if it is being added to the errorMessage string)
 * @param fieldtypeMappingFn - a component specific lookup function that will tell us both if we need to prepend the field type, and, if so, will retrieve the correct translation for the field type
 */
export const sortErrorsByLayout = ({ errors, layout, i18n, countrySpecificLabels, fieldtypeMappingFn }: SortErrorsObj): SortedErrorObject[] => {
    // Create list of field names, sorted by layout
    const sortedFieldList = Object.entries(errors).reduce((acc, [key, value]) => {
        if (value) {
            acc.push(key);
            acc.sort((a, b) => layout.indexOf(a) - layout.indexOf(b));
        }
        return acc;
    }, []);

    if (!sortedFieldList || !sortedFieldList.length) {
        return null;
    }

    // Retrieve error codes and messages, using previously created ordered fieldList to keep everything in the right order,
    // and create array of error objects
    const sortedErrors: SortedErrorObject[] = sortedFieldList.map(key => {
        const errorObj: ValidationRuleResult | SFError = errors[key];

        const SR_INDICATOR_PREFIX = '-sr'; // for testing whether SR is reading out aria-live errors (sr) or aria-describedby ones

        /** Get error codes */
        const errorCode = errorObj instanceof ValidationRuleResult ? (errorObj.errorMessage as string) : errorObj.error;

        /**
         * Get corresponding error msg
         * NOTE: the error object for a secured field already contains the error in a translated form (errorI18n).
         * For other fields we still need to translate it
         */
        const errorMsg =
            errorObj instanceof ValidationRuleResult
                ? i18n.get(errorObj.errorMessage as string) + SR_INDICATOR_PREFIX
                : errorObj.errorI18n + SR_INDICATOR_PREFIX;

        let errorMessage = errorMsg;
        /**
         * For some fields we might need to append the field type to the start of the error message (varies on a component by component basis)
         * - necessary for a11y, when we know the translated error msg doesn't contain a reference to the field it refers to
         * TODO - in the future this should be something we can get rid of once we align all our error texts and translations
         */
        if (fieldtypeMappingFn) {
            const fieldType: string = fieldtypeMappingFn(key, i18n, countrySpecificLabels); // Get translation for field type
            if (fieldType) errorMessage = `${fieldType}: ${errorMsg}`;
        }

        return { field: key, errorMessage, errorCode };
    });

    return sortedErrors;
};
