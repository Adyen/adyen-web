import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_PIN_FIELD
} from '../../../configuration/constants';
import { getPreviousTabbableNonSFElement } from '../../../ui/domUtils';
import { ShiftTabObject } from '../../../types';

// KCP scenario: Regular credit card but with additional fields -
// an encrypted pin/password field preceded by a form field of a non-SF type (d.o.b/taxRefNum)
export function shiftTabKCP(fieldType: string, rootNode: HTMLElement, hasSeparateDateFields: boolean): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: string;

    switch (fieldType) {
        case ENCRYPTED_CARD_NUMBER:
            additionalField = getPreviousTabbableNonSFElement(ENCRYPTED_CARD_NUMBER, rootNode);
            break;

        case ENCRYPTED_EXPIRY_DATE:
            fieldToFocus = ENCRYPTED_CARD_NUMBER;
            break;

        case ENCRYPTED_EXPIRY_MONTH:
            fieldToFocus = ENCRYPTED_CARD_NUMBER;
            break;

        case ENCRYPTED_EXPIRY_YEAR:
            fieldToFocus = ENCRYPTED_EXPIRY_MONTH;
            break;

        case ENCRYPTED_SECURITY_CODE:
            fieldToFocus = !hasSeparateDateFields ? ENCRYPTED_EXPIRY_DATE : ENCRYPTED_EXPIRY_YEAR;
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
