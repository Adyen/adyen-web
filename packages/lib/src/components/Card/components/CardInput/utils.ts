import { getImageUrl } from '../../../../utils/get-image';
import { BrandObject, DualBrandSelectElement } from '../../types';

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
export const createCardVariantSwitcher = (brandObj: BrandObject[], dualBrandingContainsPLCC) => {
    const leadBrand = brandObj[0];
    const subBrand = brandObj[1];

    leadBrand.dualBrandingContainsPLCC = subBrand.dualBrandingContainsPLCC = dualBrandingContainsPLCC;

    return {
        stateObject: {
            additionalSelectElements: [
                { id: leadBrand.brand, brandObject: leadBrand },
                { id: subBrand.brand, brandObject: subBrand }
            ] as DualBrandSelectElement[]
            // additionalSelectValue: leadBrand.brand, // comment out line if no initial selection is to be made
        },
        leadBrand
    };
};
