import { getImageUrl } from '../../../../utils/get-image';
import cardType from '../../../internal/SecuredFields/lib/utilities/cardType';

export const getCardImageUrl = (brand: string, loadingContext: string): string => {
    const imageOptions = {
        type: brand === 'card' ? 'nocard' : brand || 'nocard',
        extension: 'svg',
        loadingContext
    };

    return getImageUrl(imageOptions)(brand);
};

/**
 * Creates an object used for setting state - that will trigger the rendering of a select element to allow a choice between 2 different card variants
 * @param types - array containing 2 card brands or types
 * @param switcherType - type of switcher ('brandSwitcher' or 'cardTypeSwitcher' - the latter would switch between 'debit' & 'credit' varieties)
 */
export const createCardVariantSwitcher = (types: string[], switcherType: string) => {
    const leadType = types[0];
    let displayName = cardType.getDisplayName(leadType); // Works for when types are card brands e.g. 'visa', 'mc' NOT when types are 'credit'/'debit'
    const leadDisplayName = displayName || leadType;

    const subType = types[1];
    displayName = cardType.getDisplayName(subType);
    const subDisplayName = displayName || subType;

    return {
        stateObject: {
            additionalSelectElements: [
                { id: leadType, name: leadDisplayName },
                { id: subType, name: subDisplayName }
            ],
            // additionalSelectValue: leadType, // comment out line if no initial selection is to be made
            additionalSelectType: switcherType
        },
        leadType
    };
};
