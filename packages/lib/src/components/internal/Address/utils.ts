import Language from '../../../language';
import { ADDRESS_SCHEMA } from './constants';
import { AddressField } from '../../../types';

export const mapFieldKey = (key: string, i18n: Language): string => {
    if (ADDRESS_SCHEMA.includes(key as AddressField)) {
        return i18n.get(key);
    }
    return null;
};
