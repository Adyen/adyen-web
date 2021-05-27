import { BrandObject, DualBrandSelectElement } from '../../../Card/types';

/**
 * Creates an object used for setting state - that will trigger the rendering of a select element to allow a choice between 2 different card variants
 * @param brandObjArr - array containing 2 card brands objects
 */
export default function createCardVariantSwitcher(brandObjArr: BrandObject[]) {
    const leadBrand = brandObjArr[0];
    const subBrand = brandObjArr[1];

    return {
        dualBrandSelectElements: [
            { id: leadBrand.brand, brandObject: leadBrand },
            { id: subBrand.brand, brandObject: subBrand }
        ] as DualBrandSelectElement[],
        selectedBrandValue: '', // set to leadBrand.brand if an initial selection is to be made
        leadBrand
    };
}
