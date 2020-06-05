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

/**
 * Creates an object used for setting state - that will trigger the rendering of a select element to allow a choice between 2 different card variants
 * @param types - array containing 2 card brands or types
 * @param switcherType - type of switcher ('brandSwitcher' or 'cardTypeSwitcher' - the latter would switch between 'debit' & 'credit' varieties)
 */
export const createCardVariantSwitcher = (types: string[], switcherType: string) => {
    const leadType = types[0];
    let displayName = cardType.getDisplayName(leadType); // Works for when types are card brands e.g. 'visa', 'mc' NOT when types are 'credit'/'debit'
    const leadDisplayName = displayName || capitaliseFirstLetter(leadType);

    const subType = types[1];
    displayName = cardType.getDisplayName(subType);
    const subDisplayName = displayName || capitaliseFirstLetter(subType);

    return {
        stateObject: {
            additionalSelectElements: [
                { id: leadType, name: leadDisplayName },
                { id: subType, name: subDisplayName }
            ],
            additionalSelectValue: leadType,
            additionalSelectType: switcherType
        },
        leadType
    };
};
