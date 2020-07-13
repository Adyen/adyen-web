import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../../configuration/constants';
import { getPreviousTabbableNonSFElement } from '../../../ui/domUtils';
import { ShiftTabObject } from '../../../types';

// GIFT CARD scenario: SecurityCode preceded by CardNumber
export function shiftTabGiftCard(fieldType: string, rootNode: HTMLElement): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: string;

    switch (fieldType) {
        case ENCRYPTED_CARD_NUMBER:
            additionalField = getPreviousTabbableNonSFElement(ENCRYPTED_CARD_NUMBER, rootNode);

            break;

        case ENCRYPTED_SECURITY_CODE:
            fieldToFocus = ENCRYPTED_CARD_NUMBER;
            break;

        default:
            break;
    }

    return {
        fieldToFocus,
        additionalField
    };
}
