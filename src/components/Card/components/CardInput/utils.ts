import { getImageUrl } from '~/utils/get-image';
import cardType from '~/components/internal/SecuredFields/lib/utilities/cardType';

export const getCardImageUrl = (brand: string, loadingContext: string) => {
    const imageOptions = {
        type: brand === 'card' ? 'nocard' : brand || 'nocard',
        extension: 'svg',
        loadingContext
    };

    return getImageUrl(imageOptions)(brand);
};

/**
 * Takes a string and returns the same string with the first letter capitalised.
 * @param {string} string
 * @return {string}
 * @example
 *
 * capitaliseFirstLetter('test'); // => 'Test'
 */
const capitaliseFirstLetter = (string: string): string => string.charAt(0).toUpperCase() + string.slice(1);

export const createCardVariantSwitcher = (types: string[], switcherType: 'brandSwitcher' | 'cardTypeSwitcher') => {
    const leadType = types[0];
    let displayName = cardType.getDisplayName(leadType); // Works for when types are card brands e.g. 'visa', 'mc' NOT when types are 'credit'/'debit'
    const leadDisplayName = displayName || capitaliseFirstLetter(leadType);

    const subType = types[1];
    displayName = cardType.getDisplayName(subType);
    const subDisplayName = displayName || capitaliseFirstLetter(subType);

    return {
        stateObject: {
            additionalSelectElements: [{ id: leadType, name: leadDisplayName }, { id: subType, name: subDisplayName }],
            additionalSelectValue: leadType,
            additionalSelectType: switcherType
        },
        leadType
    };
};
