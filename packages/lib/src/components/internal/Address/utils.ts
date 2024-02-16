import Language from '../../../language';
import { ADDRESS_SCHEMA } from './constants';
import { AddressField } from '../../../types/global-types';
import { StringObject } from './types';

/**
 * Used by the SRPanel sorting function to tell it whether we need to prepend the field type to the SR panel message, and, if so, we retrieve the correct translation for the field type.
 * (Whether we need to prepend the field type depends on whether we know that the error message correctly reflects the label of the field. Ultimately all error messages should do this
 * and this mapping fn will become redundant)
 */
export const mapFieldKey = (key: string, i18n: Language, countrySpecificLabels: StringObject): string => {
    if (ADDRESS_SCHEMA.includes(key as AddressField)) {
        return countrySpecificLabels?.[key] ? i18n.get(countrySpecificLabels?.[key]) : i18n.get(key);
    }
    return null;
};
