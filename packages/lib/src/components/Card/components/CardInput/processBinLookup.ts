import { createCardVariantSwitcher } from './utils';
import { BinLookupResponse } from '../../types';
import { SingleBrandResetObject } from '../../../internal/SecuredFields/SecuredFieldsProvider';

// Based on values in binValueObject we might need to trigger additional markup
// e.g. a selector for brands or to choose between credit/debit card variations
export default function processBinLookup(binLookupResponse: BinLookupResponse, isReset: boolean): void {
    // RESET: The number of digits in number field has dropped below threshold for BIN lookup - so reset the UI & inform SFP
    if (!binLookupResponse) {
        this.resetAdditionalSelectState();

        // If /binLookup has 'reset' then for a generic card the internal regex will kick in to show the right brand icon
        // However for a single-branded card we need to pass the "base" type so the brand logo is reset
        const brandToReset = isReset && this.props.type !== 'card' ? this.props.type : null;

        this.sfp.current.processBinLookupResponse(binLookupResponse, {
            brand: brandToReset,
            cvcPolicy: this.props.cvcPolicy
        } as SingleBrandResetObject);
        return;
    }

    // RESULT: binLookup has found a result so proceed accordingly
    if (binLookupResponse.supportedBrands?.length) {
        const supportedBrands = binLookupResponse.supportedBrands;

        // 1) Multiple options found - add to the UI & inform SFP
        if (supportedBrands.length > 1) {
            // --
            const switchObj = createCardVariantSwitcher(supportedBrands);

            // Set properties on state to trigger a Select element in the UI
            this.setState(switchObj.stateObject); // Don't need to call validateCardInput - this will be called by the brandChange from SFP

            // Pass an object through to SFP
            this.sfp.current.processBinLookupResponse({
                issuingCountryCode: binLookupResponse.issuingCountryCode,
                supportedBrands: [switchObj.leadBrand]
            });

            // 2) Single option found (binValueObject.supportedBrands.length === 1)
        } else {
            this.resetAdditionalSelectState(); // Reset UI

            // Set (single) value from binLookup so it will be added to the 'brand' property in the paymentMethod object
            // Call validateCardInput so this new value ends up in state for the Card UIElement (Card.tsx)
            this.setState({ additionalSelectValue: supportedBrands[0].brand });

            // Pass object through to SFP
            this.sfp.current.processBinLookupResponse({
                issuingCountryCode: binLookupResponse.issuingCountryCode,
                supportedBrands
            });
        }
    }
}
