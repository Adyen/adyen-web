import { SingleBrandResetObject } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import { createCardVariantSwitcher } from './utils';
import { BrandObject } from '../../types';

export default function extensions(props, refs, states) {
    // Destructure refs and state hooks
    const { sfp } = refs;
    const { dualBrandSelectElements, setDualBrandSelectElements, setSelectedBrandValue, issuingCountryCode, setIssuingCountryCode } = states;

    return {
        /**
         * Handle the binLookup response object generated in triggerBinLookup and process it in relation to the CardInput and it's sub-components.
         * e.g. we might need to add/remove additional markup (a selector for brands), and inform SFP of the issuingCountryCode & detected brand(s).
         *
         * @param binLookupResponse -
         * @param isReset -
         */
        processBinLookup: (binLookupResponse, isReset) => {
            const issuingCode = binLookupResponse?.issuingCountryCode ? binLookupResponse.issuingCountryCode.toLowerCase() : null;
            setIssuingCountryCode(issuingCode);

            if (!binLookupResponse) {
                // Reset UI
                setDualBrandSelectElements([]);
                setSelectedBrandValue('');

                // If /binLookup has 'reset' then for a generic card the internal regex will kick in to show the right brand icon
                // However for a single-branded card we need to pass the "base" type so the brand logo is reset
                const brandToReset = isReset && props.type !== 'card' ? props.type : null;

                sfp.current.processBinLookupResponse(binLookupResponse, {
                    brand: brandToReset,
                    cvcPolicy: props.cvcPolicy // undefined except for Bancontact
                } as SingleBrandResetObject);
                return;
            }

            // RESULT: binLookup has found a result so proceed accordingly
            if (binLookupResponse.supportedBrands?.length) {
                const supportedBrands = binLookupResponse.supportedBrands;

                // 1) Multiple options found - add to the UI & inform SFP
                if (supportedBrands.length > 1) {
                    // --
                    const switcherObj = createCardVariantSwitcher(supportedBrands);

                    // Set properties on state to trigger the dual branding icons in the UI
                    setDualBrandSelectElements(switcherObj.dualBrandSelectElements);
                    setSelectedBrandValue(switcherObj.selectedBrandValue);

                    // Pass an object through to SFP
                    sfp.current.processBinLookupResponse({
                        issuingCountryCode: binLookupResponse.issuingCountryCode,
                        supportedBrands: [switcherObj.leadBrand]
                    });

                    // 2) Single option found (binValueObject.supportedBrands.length === 1)
                } else {
                    // Reset UI
                    setDualBrandSelectElements([]);
                    setSelectedBrandValue('');

                    // Set (single) value from binLookup so it will be added to the 'brand' property in the paymentMethod object
                    setSelectedBrandValue(supportedBrands[0].brand);

                    // Pass object through to SFP
                    sfp.current.processBinLookupResponse({
                        issuingCountryCode: binLookupResponse.issuingCountryCode,
                        supportedBrands
                    });
                }
            }
        },
        /**
         * Handler for clicks on the icons added in response to the /binLookup call
         * Inform SFP of the brand changes when these selections are made
         */
        handleDualBrandSelection: (e: Event): void => {
            const target = e.target as HTMLLIElement;
            const value: string = target.getAttribute('data-value') || target.getAttribute('alt');

            console.log('### CardInput extensions::handleDualBrandSelection:: brand', value);

            setSelectedBrandValue(value);

            // Find the brandObject with the matching brand value and place into an array
            const brandObjArr: BrandObject[] = dualBrandSelectElements.reduce((acc, item) => {
                if (item.brandObject.brand === value) {
                    acc.push(item.brandObject);
                }
                return acc;
            }, []);

            // Pass brand object into SecuredFields
            sfp.current.processBinLookupResponse({
                issuingCountryCode,
                supportedBrands: brandObjArr
            });
        }
    };
}
