import {
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR
} from '../../../constants';
import { getPreviousTabbableNonSFElement } from './utils';
import { SFFieldType, ShiftTabObject } from '../../../types';

// Regular Credit Card scenario
export function shiftTabCreditCard(
    fieldType: SFFieldType,
    rootNode: HTMLElement,
    hasSeparateDateFields: boolean,
    numIframes: number
): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: SFFieldType;

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
            // Shifting focus away from securedFields
            if (numIframes === 1) {
                additionalField = getPreviousTabbableNonSFElement(ENCRYPTED_SECURITY_CODE, rootNode);
            } else {
                // Focus stays within securedFields
                fieldToFocus = !hasSeparateDateFields ? ENCRYPTED_EXPIRY_DATE : ENCRYPTED_EXPIRY_YEAR;
            }
            break;

        default:
            break;
    }

    return {
        fieldToFocus,
        additionalField
    };
}
