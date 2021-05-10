import { getImageUrl } from '../../../../utils/get-image';
import { BrandObject, DualBrandSelectElement } from '../../types';
import { CVC_POLICY_HIDDEN } from '../../../internal/SecuredFields/lib/configuration/constants';

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
 * @param brandObjArr - array containing 2 card brands objects
 */
export const createCardVariantSwitcher = (brandObjArr: BrandObject[]) => {
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
};

/**
 * At some time in the future hopefully the /binLookup will be able to sort the returned brands array according to the criteria below
 * But until that happy day we must use the following Utils
 */
const objByBrand = brandStr => element => element.brand === brandStr;
const objIsPLCC = element => element.brand.includes('plcc') || element.brand.includes('cbcc');

export const sortBrandsAccordingToRules = (brandsArray: any, cardType: string): any => {
    // Don't mutate the original
    const clonedArr = brandsArray.map(item => ({ ...item }));

    const hasBCMC = clonedArr.some(objByBrand('bcmc'));
    const hasMaestro = clonedArr.some(objByBrand('maestro'));
    const hasVisa = clonedArr.some(objByBrand('visa'));
    const hasCarteBancaire = clonedArr.some(objByBrand('cartebancaire'));
    const hasPLCC = clonedArr.some(objIsPLCC);

    /**
     * RULE 1: if BCMC card component then bcmc is always the first of the dual brands
     */
    if (cardType === 'bcmc' && hasBCMC) {
        if (clonedArr[0].brand !== 'bcmc') clonedArr.reverse();
    }

    /**
     * RULE 2: if BCMC card component & bcmc is dual branded with maestro
     *  - maestro has cvcPolicy:'hidden'
     */
    if (cardType === 'bcmc' && hasBCMC && hasMaestro) {
        clonedArr[1].cvcPolicy = CVC_POLICY_HIDDEN; // Maestro already placed into index 1 by Rule 1
    }

    /**
     * RULE 3: if regular card and dual branding contains Visa & Cartebancaire - ensure Visa is first
     */
    if (cardType === 'card' && hasVisa && hasCarteBancaire) {
        if (clonedArr[0].brand !== 'visa') clonedArr.reverse();
    }

    /**
     * RULE 4: if regular card and dual branding contains a PLCC this should be shown first
     */
    if (cardType === 'card' && hasPLCC) {
        if (!clonedArr[0].brand.includes('plcc') && !clonedArr[0].brand.includes('cbcc')) clonedArr.reverse();
    }

    return clonedArr;
};
