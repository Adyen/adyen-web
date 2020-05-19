// Based on values in binValueObject we might need to trigger additional markup
// e.g. a selector for brands or to choose between credit/debit card variations
import { createCardVariantSwitcher } from '~/components/Card/components/CardInput/utils';

export default function processBinLookupResponse(binValueObject) {
    // RESET: The number of digits in number field has dropped below threshold for BIN lookup - so reset the UI & inform SFP
    if (!binValueObject) {
        this.resetAdditionalSelectState();
        this.sfp.processBinLookupResponse(binValueObject);
        return;
    }

    // RESULT: binLookup has found a result so proceed accordingly
    if (binValueObject.brands && binValueObject.brands.length) {
        // 1) Multiple options found - add to the UI & inform SFP if appropriate
        if (binValueObject.brands.length > 1) {
            // --
            let switchObj;

            switch (binValueObject.issuingCountryCode) {
                // --
                case 'FR':
                    switchObj = createCardVariantSwitcher(binValueObject.brands, 'brandSwitcher');

                    // Set properties on state to trigger a Select element in the UI
                    this.setState(switchObj.stateObject); // Don't need to call validateCardInput - this will be called by the brandChange from SFP

                    // Pass an object through to SFP
                    this.sfp.processBinLookupResponse({ brands: [switchObj.leadType] });
                    break;

                case 'BR':
                    switchObj = createCardVariantSwitcher(binValueObject.brands, 'cardTypeSwitcher');
                    this.setState(switchObj.stateObject, this.validateCardInput);
                    break;

                default:
                    break;
            }

            // 2) Single option found (binValueObject.brands.length === 1)
        } else {
            this.resetAdditionalSelectState(); // Reset UI

            // Pass object through to SFP
            this.sfp.processBinLookupResponse(binValueObject);
        }
    }
}
