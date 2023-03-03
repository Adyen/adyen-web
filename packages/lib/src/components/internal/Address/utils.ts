import Language from '../../../language';
import { ADDRESS_SCHEMA } from './constants';
import { AddressField } from '../../../types';
import { StringObject } from './types';

export const mapFieldKey = (key: string, i18n: Language, countrySpecificLabels: StringObject): string => {
    if (ADDRESS_SCHEMA.includes(key as AddressField)) {
        return countrySpecificLabels?.[key] ? i18n.get(countrySpecificLabels?.[key]) : i18n.get(key);
    }
    return null;
};
