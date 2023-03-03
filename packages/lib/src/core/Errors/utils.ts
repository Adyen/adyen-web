import { ERROR_CODES } from './constants';
import { SFError } from '../../components/Card/components/CardInput/types';
import { SortErrorsObj, SortedErrorObject, GenericError } from './types';
import { ValidationRuleResult } from '../../utils/Validator/ValidationRuleResult';
import { setFocusOnField } from '../../utils/setFocus';

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
 * @param layout - a string[] controlling how the output error objects will be ordered. Only required when it is known that the error object is not already populated in the right order e.g. Card comp
 * @param i18n - our internal Language mechanism
 * @param countrySpecificLabels - some errors are region specific, e.g. in the US "postal code" = "zip code", so map the fieldType value accordingly (if it is being added to the errorMessage string)
 * @param fieldtypeMappingFn - a component specific lookup function that will tell us both if we need to prepend the field type, and, if so, will retrieve the correct translation for the field type
 */
export const sortErrorsByLayout = ({ errors, i18n, layout, countrySpecificLabels, fieldTypeMappingFn }: SortErrorsObj): SortedErrorObject[] => {
    const SR_INDICATOR_PREFIX = process.env.NODE_ENV === 'production' ? '' : '-sr'; // Useful for testing whether SR is reading out aria-live errors (sr) or aria-describedby ones

    // Create array of error objects, sorted by layout
    const sortedErrors: SortedErrorObject[] = Object.entries(errors).reduce((acc, [key, value]) => {
        if (value) {
            const errObj: ValidationRuleResult | SFError | GenericError = errors[key];
            // console.log('### utils::sortErrorsByLayout:: key', key, 'errObj', errObj);

            /**
             * Get error codes - these are used if we need to distinguish between showValidation & onBlur errors
             * - For a ValidationRuleResult or GenericError the error "code" is contained in the errorMessage prop.
             * - For an SFError the error "code" is contained in the error prop.
             */
            let errorCode: string;
            if (!(errObj instanceof ValidationRuleResult)) {
                errorCode = errObj.error; // is SFError
            } else {
                /** Special handling for Address~postalCode which can have be passed an object in the 'errorMessage' prop containing a country specific error */
                if (typeof errObj.errorMessage === 'object') {
                    errorCode = errObj.errorMessage.translationKey; // is ValidationRuleResult w. country specific error
                } else {
                    errorCode = errObj.errorMessage; // is ValidationRuleResult || GenericError || an as yet incorrectly formed error
                }
            }

            /**
             * Get corresponding error msg - a translated string we can place into the SRPanel
             * NOTE: the error object for a secured field already contains the error in a translated form (errorI18n).
             * For other fields we still need to translate it, so we use the errorMessage prop as a translation key
             */
            let errorMsg: string;
            if (!(errObj instanceof ValidationRuleResult) && 'errorI18n' in errObj) {
                errorMsg = errObj.errorI18n + SR_INDICATOR_PREFIX; // is SFError
            } else {
                /** Special handling for Address~postalCode (see above) */
                if (typeof errObj.errorMessage === 'object') {
                    /* prettier-ignore */
                    errorMsg = `${i18n.get(errObj.errorMessage.translationKey)} ${errObj.errorMessage.translationObject.values.format}${SR_INDICATOR_PREFIX}`; // is ValidationRuleResult  w. country specific error
                } else {
                    errorMsg = i18n.get(errObj.errorMessage) + SR_INDICATOR_PREFIX; // is ValidationRuleResult || GenericError || an as yet incorrectly formed error
                }
            }

            let errorMessage = errorMsg;
            /**
             * For some fields we might need to append the field type to the start of the error message (varies on a component by component basis)
             * - necessary for a11y, when we know the translated error msg doesn't contain a reference to the field it refers to
             * TODO - in the future this should be something we can get rid of once we align all our error texts and translations
             */
            if (fieldTypeMappingFn) {
                const fieldType: string = fieldTypeMappingFn(key, i18n, countrySpecificLabels); // Get translation for field type
                if (fieldType) errorMessage = `${fieldType}: ${errorMsg}`;
            }

            acc.push({ field: key, errorMessage, errorCode });

            if (layout) acc.sort((a, b) => layout.indexOf(a.field) - layout.indexOf(b.field));
        }
        return acc;
    }, []);

    return sortedErrors;
};

/**
 * Implemented as a partial, with an object containing the first 6 arguments; then the final argument, errors, is passed to the partial
 *
 * NOTE: using this generic error setting fny is only suitable when errors for the SRPanel are *only* generated by showValidation().
 * When errors are also generated onBlur, as the user leaves the input, the SR message generation becomes more complex - see CardInput as an example
 */
export const setSRMessagesFromErrors = ({ i18n, fieldTypeMappingFn, isValidating, SRPanelRef, moveFocusOnSubmitErrors, focusSelector }, errors) => {
    const currentErrorsSortedByLayout = sortErrorsByLayout({
        errors,
        i18n,
        fieldTypeMappingFn
    });

    const doLog = false;

    if (doLog) console.log('### setSRMessagesFromErrors::currentErrorsSortedByLayout:: ', currentErrorsSortedByLayout);

    if (currentErrorsSortedByLayout) {
        /** If validating i.e. "on submit" type event - then display all errors in the SR panel */
        if (isValidating.current) {
            const errorMsgArr: string[] = currentErrorsSortedByLayout.map(errObj => errObj.errorMessage);
            SRPanelRef.setMessages(errorMsgArr);

            if (moveFocusOnSubmitErrors) {
                const fieldListArr: string[] = currentErrorsSortedByLayout.map(errObj => errObj.field);
                setFocusOnField(focusSelector, fieldListArr[0]);
            }

            // Remove 'showValidation' mode - allowing time for collation of all the fields in error whilst it is 'showValidation' mode (some errors come in a second render pass)
            setTimeout(() => {
                isValidating.current = false;
            }, 300);
        } else {
            if (doLog) console.log('### setSRMessagesFromErrors::componentDidUpdate:: clearing errors:: updating but not validating');
            SRPanelRef?.setMessages(null);
        }
    } else {
        if (doLog) console.log('### setSRMessagesFromErrors::componentDidUpdate:: clearing errors:: NO currentErrorsSortedByLayout');
        SRPanelRef.setMessages(null); // not validating - so clear SR panel
    }
};

export const enhanceErrorObjectKeys = (errorObj, keyPrefix) => {
    if (!errorObj) return null;
    const enhancedObj = Object.entries(errorObj).reduce((acc, [key, value]) => {
        if (value) {
            const newKey = `${keyPrefix}${key}`;
            acc[newKey] = value;
        }
        return acc;
    }, {});

    return enhancedObj;
};
