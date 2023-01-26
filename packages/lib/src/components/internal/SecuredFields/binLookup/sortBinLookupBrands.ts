import { CVC_POLICY_HIDDEN } from '../lib/configuration/constants';

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
     *  TODO - NOTE: this now applies to all situations where bcmc is dual branded with maestro
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
