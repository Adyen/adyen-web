import { HOSTED_NUMBER_FIELD, HOSTED_CVC_FIELD } from '../../../configuration/constants';
import { getPreviousTabbableNonSFElement } from '../../../ui/domUtils';
import { ShiftTabObject } from '~/components/internal/SecuredFields/lib/types';

// GIFT CARD scenario: SecurityCode preceded by CardNumber
export function shiftTabGiftCard(fieldType: string, rootNode: HTMLElement): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: string;

    switch (fieldType) {
        case HOSTED_NUMBER_FIELD:
            additionalField = getPreviousTabbableNonSFElement(HOSTED_NUMBER_FIELD, rootNode);

            break;

        case HOSTED_CVC_FIELD:
            fieldToFocus = HOSTED_NUMBER_FIELD;
            break;

        default:
            break;
    }

    return {
        fieldToFocus,
        additionalField
    };
}
