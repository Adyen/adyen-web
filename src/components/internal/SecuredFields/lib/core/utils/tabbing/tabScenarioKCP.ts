import {
    HOSTED_NUMBER_FIELD,
    HOSTED_CVC_FIELD,
    HOSTED_DATE_FIELD,
    HOSTED_MONTH_FIELD,
    HOSTED_YEAR_FIELD,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_PIN_FIELD
} from '../../../configuration/constants';
import { getPreviousTabbableNonSFElement } from '../../../ui/domUtils';
import { ShiftTabObject } from '~/components/internal/SecuredFields/lib/types';

// KCP scenario: Regular credit card but with additional fields -
// an encrypted pin/password field preceded by a form field of a non-SF type (d.o.b/taxRefNum)
export function shiftTabKCP(fieldType: string, rootNode: HTMLElement, hasSeparateDateFields: boolean): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: string;

    switch (fieldType) {
        case HOSTED_NUMBER_FIELD:
            additionalField = getPreviousTabbableNonSFElement(HOSTED_NUMBER_FIELD, rootNode);
            break;

        case HOSTED_DATE_FIELD:
            fieldToFocus = HOSTED_NUMBER_FIELD;
            break;

        case HOSTED_MONTH_FIELD:
            fieldToFocus = HOSTED_NUMBER_FIELD;
            break;

        case HOSTED_YEAR_FIELD:
            fieldToFocus = HOSTED_MONTH_FIELD;
            break;

        case HOSTED_CVC_FIELD:
            fieldToFocus = !hasSeparateDateFields ? HOSTED_DATE_FIELD : HOSTED_YEAR_FIELD;
            break;

        case ENCRYPTED_PWD_FIELD:
        case ENCRYPTED_PIN_FIELD:
            additionalField = getPreviousTabbableNonSFElement(fieldType, rootNode);
            break;

        default:
            break;
    }

    return {
        fieldToFocus,
        additionalField
    };
}
