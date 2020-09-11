import { ENCRYPTED_BANK_ACCNT_NUMBER_FIELD, ENCRYPTED_BANK_LOCATION_FIELD } from '../../../configuration/constants';
import { ShiftTabObject } from '../../../types';

// ACH scenario: bankAccountNumber SF followed by a bankLocationId SF
export function shiftTabACH(fieldType): ShiftTabObject {
    let additionalField: HTMLElement;
    let fieldToFocus: string;

    if (fieldType === ENCRYPTED_BANK_LOCATION_FIELD) {
        fieldToFocus = ENCRYPTED_BANK_ACCNT_NUMBER_FIELD;
    }

    return {
        fieldToFocus,
        additionalField
    };
}
