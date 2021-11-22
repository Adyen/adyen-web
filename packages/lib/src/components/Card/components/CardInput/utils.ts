import { getImageUrl } from '../../../../utils/get-image';
import { ErrorPanelObj } from '../../../../core/Errors/ErrorPanel';
import Language from '../../../../language/Language';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';
import { ErrorObj } from './types';

export const getCardImageUrl = (brand: string, loadingContext: string): string => {
    const imageOptions = {
        type: brand === 'card' ? 'nocard' : brand || 'nocard',
        extension: 'svg',
        loadingContext
    };

    return getImageUrl(imageOptions)(brand);
};

const mapFieldKey = (key: string, i18n: Language): string => {
    switch (key) {
        case 'holderName':
            return i18n.get(`creditCard.${key}`);
            break;
        case 'taxNumber':
            return i18n.get(`creditCard.${key}`);
            break;
        default: {
            // Map all securedField field types to 'creditCard' - with 2 exceptions
            const type = ['ach', 'giftcard'].includes(key) ? key : 'creditCard';
            return i18n.get(`${type}.${key}.aria.label`);
        }
    }
};

export const sortErrorsForPanel = (errors: ErrorObj, layout: string[], i18n: Language): ErrorPanelObj => {
    // Create array of fields with active errors, ordered according to passed layout
    const fieldList = Object.entries(errors).reduce((acc, [key, value]) => {
        if (value) {
            acc.push(key);
            acc.sort((a, b) => layout.indexOf(a) - layout.indexOf(b));
        }
        return acc;
    }, []);

    if (!fieldList || !fieldList.length) return null;

    // Create array of error messages to display
    const errorMessages = fieldList.map(key => {
        // Get translation for field type
        const errorKey: string = mapFieldKey(key, i18n);
        // Get corresponding error msg
        const errorMsg = hasOwnProperty(errors[key], 'errorI18n') ? errors[key].errorI18n : i18n.get(errors[key].errorMessage);

        return `${errorKey}: ${errorMsg}`;
    });

    return !errorMessages.length ? null : { errorMessages, fieldList };
};
