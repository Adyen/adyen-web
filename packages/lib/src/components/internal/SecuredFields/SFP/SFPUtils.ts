// ROUTINES USED IN SecuredFieldsProvider.componentDidMount TO DETECT & MAP FIELD NAMES ///////////
import {
    CVC_POLICY_HIDDEN,
    CVC_POLICY_OPTIONAL,
    DATE_POLICY_HIDDEN,
    DATE_POLICY_OPTIONAL,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE
} from '../lib/constants';
import getProp from '../../../../utils/getProp';
import { EMPTY_FIELD_ERROR_MESSAGES } from '../../../../core/Errors/constants';

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
 * Skip generating an error for an optional field, unless it is already in error
 */
const skipOptionalFields = (field, state, fieldNames) => {
    // console.log('\n### utils::skipOptionalField3:: examining field=', field);
    const { isFieldOfType, fieldIsValid } = fieldNames.reduce(
        (acc, fieldName) => {
            if (!acc.isFieldOfType) {
                // console.log('### utils:: fieldName:: ', fieldName, 'match=', field === fieldName);
                acc.isFieldOfType = field === fieldName;
                acc.fieldIsValid = !state.errors[fieldName];
            }
            return acc;
        },
        { isFieldOfType: false, fieldIsValid: false }
    );

    const policyType = field === ENCRYPTED_SECURITY_CODE ? 'cvcPolicy' : 'expiryDatePolicy';

    const policyOptional = policyType === 'cvcPolicy' ? CVC_POLICY_OPTIONAL : DATE_POLICY_OPTIONAL;
    const policyHidden = policyType === 'cvcPolicy' ? CVC_POLICY_HIDDEN : DATE_POLICY_HIDDEN;

    // if policy != required
    return (state[policyType] === policyOptional || state[policyType] === policyHidden) && fieldIsValid && isFieldOfType ? null : field;
};

export const getErrorReducer = (numDateFields, state) => (acc, field) => {
    // We're only interested in the non-valid fields from the state.valid object...
    let val =
        state.valid[field] !== true
            ? mapDateFields(field, numDateFields) // Map the keys we use for the valid state to the key(s) we use for the error state
            : null;

    // Skip error generation for optional/hidden CVC & Date unless the fields are already in error
    val = skipOptionalFields(val, state, [ENCRYPTED_SECURITY_CODE, ENCRYPTED_EXPIRY_DATE, ENCRYPTED_EXPIRY_MONTH, ENCRYPTED_EXPIRY_YEAR]);

    // console.log('### utils:::: ############# val=', val);

    if (val && !acc.includes(val)) acc.push(val);

    return acc;
};

/**
 * Create an object suitable for sending to our handleOnError function
 */
export const getErrorObject = (fieldType, rootNode, state) => {
    // Get existing error OR field is empty in which case get field specific msg OR use default
    const error = getProp(state, `errors.${fieldType}`) || EMPTY_FIELD_ERROR_MESSAGES[fieldType];
    return {
        rootNode,
        fieldType,
        error,
        type: 'card'
    };
};
// -- end ROUTINES USED IN SecuredFieldsProvider.showValidation -----------------------
