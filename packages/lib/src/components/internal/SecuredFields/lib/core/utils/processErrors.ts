import { CbObjOnError, SFFeedbackObj } from '../../types';
import SecuredField from '../../../../../../components/internal/SecuredFields/lib/core/SecuredField';
import { getError } from '../../../../../../core/Errors/utils';
import { ERROR_CODES, ERROR_MSG_UNSUPPORTED_CARD_ENTERED } from '../../../../../../core/Errors/constants';
// import * as logger from '../../utilities/logger'

type RtnType_callbackFn = (obj: CbObjOnError) => void;

export const processErrors = (
    pFeedbackObj: SFFeedbackObj,
    securedField: SecuredField,
    type: string,
    rootNode: HTMLElement,
    callbackFn: RtnType_callbackFn
): CbObjOnError => {
    if (!Object.prototype.hasOwnProperty.call(pFeedbackObj, 'error')) return null;

    const fieldType: string = pFeedbackObj.fieldType;

    const field: SecuredField = securedField;

    // Initialise error callback object
    const dataObj: CbObjOnError = { rootNode, fieldType, error: null, type: null };

    const isError: boolean = pFeedbackObj.error !== '';

    console.log('\n### processErrors::processErrors:: pFeedbackObj', pFeedbackObj);
    console.log('### processErrors::processErrors:: isError', isError);
    console.log('### processErrors:: field.hasError', field.hasError, 'existing error=', field.errorType, 'aka:', getError(field.errorType));

    // Error is empty string && field is not already in error - do nothing
    // This situation arises when we encrypt a field and trigger an "error clearing" event - however we don't need to propagate this non-error
    // if the field wasn't already in error
    if (!isError && !field.hasError) {
        console.log('### processErrors::Error is empty string && field is not already in error:: RETURN');
        return null;
    }

    if (field.errorType === ERROR_CODES[ERROR_MSG_UNSUPPORTED_CARD_ENTERED]) {
        console.log('### processErrors::Field already has an unsupportedCard error RETURN');
        return null;
    }

    dataObj.error = isError ? pFeedbackObj.error : '';
    dataObj.type = type;

    // Set error state & type on securedField instance
    field.hasError = isError;
    field.errorType = dataObj.error;

    console.log('### processErrors::processErrors:: ', fieldType, ' new error=', getError(field.errorType));

    callbackFn(dataObj);

    return dataObj;
};
