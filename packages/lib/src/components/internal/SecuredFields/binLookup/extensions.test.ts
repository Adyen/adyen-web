import extensions, { cloneBrandsArr, containsExcludedBrand, removeExcludedBrand } from './extensions';
import { BRAND_ICON_UI_EXCLUSION_LIST, CVC_POLICY_REQUIRED } from '../lib/configuration/constants';

let CIExtensions;

// Mock sfp useRef
let sfp = {
    current: {
        processBinLookupResponse: () => {}
    }
};

let issuingCountryCode = null;
let setIssuingCountryCode;

let dualBrandSelectElements = [];
let setDualBrandSelectElements;

let selectedBrandValue = '';
let setSelectedBrandValue;

beforeEach(() => {
    console.log = jest.fn(() => {});

    setIssuingCountryCode = jest.fn(countryCode => {
        issuingCountryCode = countryCode;
    });

    setDualBrandSelectElements = jest.fn(selectElements => {
        dualBrandSelectElements = selectElements;
    });

    setSelectedBrandValue = jest.fn(selectVal => {
        selectedBrandValue = selectVal;
    });

    CIExtensions = extensions({}, { sfp }, { setSelectedBrandValue, setDualBrandSelectElements, setIssuingCountryCode }, {});
});

describe('Testing CardInput extensions (handling binLookup response related functionality)', () => {
    test('issuingCountryCode state var is converted to lowerCase', () => {
        CIExtensions.processBinLookup({ issuingCountryCode: 'KR' }, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('kr');
    });
});

describe('Test mock binLookup results on CardInput.state', () => {
    const dualBrandObj1 = {
        brand: 'visa',
        cvcPolicy: CVC_POLICY_REQUIRED,
        enableLuhnCheck: true,
        showExpiryDate: true,
        supported: true
    };

    const dualBrandObj2 = {
        brand: 'cartebancaire',
        cvcPolicy: CVC_POLICY_REQUIRED,
        enableLuhnCheck: true,
        showExpiryDate: true,
        supported: true
    };

    const dualBrandObj3 = {
        brand: 'star',
        cvcPolicy: CVC_POLICY_REQUIRED,
        enableLuhnCheck: true,
        showExpiryDate: true,
        supported: true
    };

    const mockBinLookupObj_dual = {
        issuingCountryCode: 'FR',
        supportedBrands: [dualBrandObj1, dualBrandObj2]
    };

    const mockBinLookupObj_dual_with_hidden = {
        issuingCountryCode: 'US',
        supportedBrands: [dualBrandObj1, dualBrandObj3]
    };

    const mockBinLookupObj_single = {
        issuingCountryCode: 'US',
        supportedBrands: [
            {
                brand: 'mc',
                cvcPolicy: 'required',
                enableLuhnCheck: 'true',
                showExpiryDate: 'true',
                supported: 'true'
            }
        ]
    };

    test('CardInput.state contains expected values from a "dual-branded" lookup result', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('fr');

        expect(dualBrandSelectElements).toEqual([
            { id: 'visa', brandObject: dualBrandObj1 },
            { id: 'cartebancaire', brandObject: dualBrandObj2 }
        ]);

        expect(selectedBrandValue).toEqual(''); // no auto brand selection
    });

    test('CardInput.state is altered when a "dual-branded" lookup result is followed by a "single" lookup result ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('fr');

        CIExtensions.processBinLookup(mockBinLookupObj_single, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(2);
        expect(issuingCountryCode).toEqual('us');

        expect(dualBrandSelectElements).toEqual([]);
        expect(selectedBrandValue).toEqual('mc'); // auto brand selection
    });

    test('CardInput.state is altered when a "dual-branded" lookup result is followed by a "reset" result ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('fr');

        CIExtensions.processBinLookup(null, true);

        expect(issuingCountryCode).toEqual(null);

        expect(dualBrandSelectElements).toEqual([]);
        expect(selectedBrandValue).toEqual('');
    });

    test('CardInput.state is altered when a "single" lookup result is followed by a "reset" result ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_single, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('us');

        expect(dualBrandSelectElements).toEqual([]);
        expect(selectedBrandValue).toEqual('mc');

        CIExtensions.processBinLookup(null, true);

        expect(issuingCountryCode).toEqual(null);

        expect(dualBrandSelectElements).toEqual([]);
        expect(selectedBrandValue).toEqual('');
    });

    test('CardInput.state is altered when a "dual" lookup result contains a brand that should be hidden from the UI ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual_with_hidden, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('us');

        // no dual branding
        expect(dualBrandSelectElements).toEqual([]);
        // but also no "single-branded" automatic selection of a brand value
        expect(selectedBrandValue).toEqual('');

        // now make a single branded call
        CIExtensions.processBinLookup(mockBinLookupObj_single, false);

        expect(selectedBrandValue).toEqual('mc'); // auto brand selection

        // add "reset" result
        CIExtensions.processBinLookup(null, true);

        expect(issuingCountryCode).toEqual(null);

        expect(dualBrandSelectElements).toEqual([]);
        expect(selectedBrandValue).toEqual('');
    });

    /** Test utils */
    test('BinLookup returns array containing "excluded" brands - this should be noted & the excluded brand rejected', () => {
        const brandsArray = mockBinLookupObj_dual_with_hidden.supportedBrands;

        // note
        expect(containsExcludedBrand(brandsArray, BRAND_ICON_UI_EXCLUSION_LIST)).toEqual(true);

        // reject
        const strippedArray = removeExcludedBrand(brandsArray);
        expect(strippedArray.length).toEqual(1);
        expect(strippedArray[0].brand).toEqual('visa');

        // Extra: check cloning works - recursively compare all properties
        expect(cloneBrandsArr(brandsArray)).toEqual(brandsArray);
    });

    test('BinLookup returns array containing "excluded" brands - excluded brand is rejected even if the brands array is reversed', () => {
        const reversedBrandsArray = [dualBrandObj3, dualBrandObj1];

        const strippedArray = removeExcludedBrand(reversedBrandsArray);
        expect(strippedArray.length).toEqual(1);
        expect(strippedArray[0].brand).toEqual('visa');
    });
});
