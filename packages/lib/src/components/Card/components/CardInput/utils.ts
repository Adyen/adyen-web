import { getImageUrl } from '../../../../utils/get-image';

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
export const createCardVariantSwitcher = (types: string[]) => {
    const leadType = types[0];
    const subType = types[1];

    return {
        stateObject: {
            additionalSelectElements: [{ id: leadType }, { id: subType }]
            // additionalSelectValue: leadType, // comment out line if no initial selection is to be made
        },
        leadType
    };
};
