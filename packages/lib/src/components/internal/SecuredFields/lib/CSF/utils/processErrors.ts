import { CbObjOnError, SFFeedbackObj } from '../../types';
import SecuredField from '../../securedField/SecuredField';
import { ERROR_CODES, ERROR_MSG_UNSUPPORTED_CARD_ENTERED } from '../../../../../../core/Errors/constants';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';

type RtnType_callbackFn = (obj: CbObjOnError) => void;

export const processErrors = (
    pFeedbackObj: SFFeedbackObj,
    securedField: SecuredField,
    type: string,
    rootNode: HTMLElement,
    callbackFn: RtnType_callbackFn
): CbObjOnError => {
    if (!hasOwnProperty(pFeedbackObj, 'error')) return null;

    const fieldType: string = pFeedbackObj.fieldType;

    const field: SecuredField = securedField;

    // Initialise error callback object
    const dataObj: CbObjOnError = { rootNode, fieldType, error: null, type: null };

    const isError: boolean = pFeedbackObj.error !== '';

    // Error is empty string && field is not already in error: do nothing - don't need to propagate this non-error if the field wasn't already in error
    // This situation arises when we encrypt a field and trigger an "error clearing" event i.e. deleting a character
    // It also arises when an unsupportedCard (re. binLookup) is entered and the shopper continues to interact with the field (adding or deleting digits)
    if (!isError && !field.hasError) {
        return null;
    }

    // TODO - probably not needed after sf 3.5.3 is available
    // Ignore other errors whilst the field is in an "unsupportedCard" error state
    if (field.errorType === ERROR_CODES[ERROR_MSG_UNSUPPORTED_CARD_ENTERED]) {
        // Temporary - for testing in development after sf 3.5.3 is ready
        // if (process.env.NODE_ENV === 'development') {
        //     throw new Error('processErrors:: RETURNING BECAUSE errorType = "unsupported card"');
        // }
        return null;
    }
    // TODO - end

    // Add props to error callback object
    dataObj.error = isError ? pFeedbackObj.error : '';
    dataObj.type = type;

    // Set error state & type on securedField instance
    field.hasError = isError;
    field.errorType = dataObj.error;

    callbackFn(dataObj);

    return dataObj;
};
