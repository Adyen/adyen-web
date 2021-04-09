import { SingleBrandResetObject } from '../../../internal/SecuredFields/SecuredFieldsProvider';
import { createCardVariantSwitcherHook } from './utils';
import { BrandObject } from '../../types';

export default function extensions(props, refs, states) {
    // Destructure refs and state hooks
    const { sfp } = refs;
    const { additionalSelectElements, setAdditionalSelectElements, setAdditionalSelectValue, issuingCountryCode, setIssuingCountryCode } = states;

    console.log('### extensions::extensions:: sfp=', sfp);

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
                setAdditionalSelectElements([]);
                setAdditionalSelectValue('');

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
                    const switcherObj = createCardVariantSwitcherHook(supportedBrands);

                    // Set properties on state to trigger the dual branding icons in the UI
                    // Don't need to call validateCardInput - this will be called by the brandChange from SFP
                    setAdditionalSelectElements(switcherObj.additionalSelectElements);
                    setAdditionalSelectValue(switcherObj.additionalSelectValue);

                    // Pass an object through to SFP
                    sfp.current.processBinLookupResponse({
                        issuingCountryCode: binLookupResponse.issuingCountryCode,
                        supportedBrands: [switcherObj.leadBrand]
                    });

                    // 2) Single option found (binValueObject.supportedBrands.length === 1)
                } else {
                    // Reset UI
                    setAdditionalSelectElements([]);
                    setAdditionalSelectValue('');

                    // Set (single) value from binLookup so it will be added to the 'brand' property in the paymentMethod object
                    // Call validateCardInput so this new value ends up in state for the Card UIElement (Card.tsx)
                    setAdditionalSelectValue(supportedBrands[0].brand);

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
            const value: string = (e.target as HTMLLIElement).getAttribute('data-value');

            setAdditionalSelectValue(value);

            // Find the brandObject with the matching brand value and place into an array
            const brandObjArr: BrandObject[] = additionalSelectElements.reduce((acc, item) => {
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
