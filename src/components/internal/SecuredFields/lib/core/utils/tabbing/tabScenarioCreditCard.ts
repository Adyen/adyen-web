import { HOSTED_NUMBER_FIELD, HOSTED_CVC_FIELD, HOSTED_DATE_FIELD, HOSTED_MONTH_FIELD, HOSTED_YEAR_FIELD } from '../../../configuration/constants';
import { getPreviousTabbableNonSFElement } from '../../../ui/domUtils';
import { ShiftTabObject } from '~/components/internal/SecuredFields/lib/types';

// Regular Credit Card scenario
export function shiftTabCreditCard(fieldType: string, rootNode: HTMLElement, hasSeparateDateFields: boolean, numIframes: number): ShiftTabObject {
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
            // Shifting focus away from securedFields
            if (numIframes === 1) {
                additionalField = getPreviousTabbableNonSFElement(HOSTED_CVC_FIELD, rootNode);
            } else {
                // Focus stays within securedFields
                fieldToFocus = !hasSeparateDateFields ? HOSTED_DATE_FIELD : HOSTED_YEAR_FIELD;
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
