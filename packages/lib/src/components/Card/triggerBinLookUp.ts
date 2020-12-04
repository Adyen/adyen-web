import fetchJSONData from '../../utils/fetch-json-data';
import { CbObjOnError } from '../internal/SecuredFields/lib/types';
import { DEFAULT_CARD_GROUP_TYPES } from '../internal/SecuredFields/lib/configuration/constants';
import { getError } from '../../core/Errors/utils';
import { ERROR_MSG_UNSUPPORTED_CARD_ENTERED } from '../../core/Errors/constants';

export default function triggerBinLookUp(callbackObj) {
    // Allow way for merchant to disallow binLookup by specifically setting the prop to false
    if (this.props.doBinLookup === false) {
        if (this.props.onBinValue) this.props.onBinValue(callbackObj);
        return;
    }

    // Do binLookup when encryptedBin property is present (and only if the merchant is using a clientKey)
    if (callbackObj.encryptedBin && this.props.clientKey) {
        // Store id of request we're about to make
        this.currentRequestId = callbackObj.uuid;

        fetchJSONData(
            {
                path: `v1/bin/binLookup?token=${this.props.clientKey}`,
                loadingContext: this.props.loadingContext,
                method: 'POST',
                contentType: 'application/json'
            },
            {
                supportedBrands: this.props.brands || DEFAULT_CARD_GROUP_TYPES,
                encryptedBin: callbackObj.encryptedBin,
                requestId: callbackObj.uuid // Pass id of request
            }
        ).then(data => {
            // If response is the one we were waiting for...
            if (data?.requestId === this.currentRequestId) {
                /**
                 * supportedBrands = merchant supports this brand(s); we have detected the card number to be of this brand(s); carry on!
                 */
                if (data.supportedBrands?.length) {
                    // ...call processBinLookupResponse with the response object if it contains at least one supported brand
                    this.processBinLookupResponse(data);
                    return;
                }
                /**
                 * detectedBrands = no brands the merchant supports were found; what we did detect the shopper to be entering was this brand; error!
                 */
                if (data.detectedBrands?.length) {
                    const errObj: CbObjOnError = {
                        type: 'card',
                        fieldType: 'encryptedCardNumber',
                        error: getError(ERROR_MSG_UNSUPPORTED_CARD_ENTERED),
                        binLookupBrands: data.detectedBrands
                    };
                    this.handleUnsupportedCard(errObj);
                    return;
                }
                // A failed lookup will just contain requestId - we may still need to do something at this point
                // console.log('### Card::onBinValue:: binLookup response - no match found for request:', data.requestId);
            }
        });
    } else if (this.currentRequestId) {
        // If onBinValue callback is called AND we have been doing binLookup BUT passed object doesn't have an encryptedBin property
        // - then the number of digits in number field has dropped below threshold for BIN lookup - so reset the UI
        this.processBinLookupResponse(null);

        this.currentRequestId = null; // Ignore any pending responses

        // Reset any errors
        const errObj: CbObjOnError = {
            type: 'card',
            fieldType: 'encryptedCardNumber',
            error: ''
        };
        this.handleUnsupportedCard(errObj);
    }

    if (this.props.onBinValue) this.props.onBinValue(callbackObj);
}
