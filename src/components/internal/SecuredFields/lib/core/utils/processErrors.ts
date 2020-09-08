import { CbObjOnError, SFFeedbackObj } from '../../types';
import SecuredField from '../../../../../../components/internal/SecuredFields/lib/core/SecuredField';
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

    // console.log('\n### processErrors::processErrors:: !!!');

    const fieldType: string = pFeedbackObj.fieldType;

    const field: SecuredField = securedField;

    // Initialise error callback object
    const dataObj: CbObjOnError = { rootNode, fieldType, error: null, type: null };

    const isError: boolean = pFeedbackObj.error !== '';

    // Error is empty string && field is not already in error - do nothing
    // This situation arises when we encrypt a field and trigger an "error clearing" event - however we don't need to propagate this non-error
    // if the field wasn't already in error
    if (!isError && !field.hasError) return null;

    dataObj.error = isError ? pFeedbackObj.error : '';
    dataObj.type = type;

    // Set error state & type on securedField instance
    field.hasError = isError;
    field.errorType = dataObj.error;

    // logger.log('### processErrors::processErrors:: ',fieldType,'errorType=',securedField.errorType);

    callbackFn(dataObj);

    return dataObj;
};
