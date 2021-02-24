import { httpPost } from '../../core/Services/http';
import { CbObjOnBinLookup, CbObjOnBinValue, CbObjOnError } from '../internal/SecuredFields/lib/types';
import { DEFAULT_CARD_GROUP_TYPES } from '../internal/SecuredFields/lib/configuration/constants';
import { getError } from '../../core/Errors/utils';
import { ERROR_MSG_UNSUPPORTED_CARD_ENTERED } from '../../core/Errors/constants';
import { BinLookupResponse, BinLookupResponseRaw } from './types';

export default function triggerBinLookUp(callbackObj: CbObjOnBinValue) {
    // Allow way for merchant to disallow binLookup by specifically setting the prop to false
    if (this.props.doBinLookup === false) {
        if (this.props.onBinValue) this.props.onBinValue(callbackObj);
        return;
    }

    // Do binLookup when encryptedBin property is present (and only if the merchant is using a clientKey)
    if (callbackObj.encryptedBin && this.props.clientKey) {
        // Store id of request we're about to make
        this.currentRequestId = callbackObj.uuid;

        httpPost(
            {
                loadingContext: this.props.loadingContext,
                path: `v2/bin/binLookup?token=${this.props.clientKey}`
            },
            {
                supportedBrands: this.props.brands || DEFAULT_CARD_GROUP_TYPES,
                encryptedBin: callbackObj.encryptedBin,
                // TODO - now have to fake a bin if loading SF locally
                // encryptedBin:
                //     'adyenjs_0_1_25$Idz96ona3pX2SieM/Q9O5XwQa/2rNmAsmjlY+pwe85+K1O4WbtomkpOUDNG29DtCBlGXFlq4uZurEiabsJ/wdbfXfQAZwPKi1tD/0h4Uq9Q3Z3vJZDFFRaMQ31w+6RxqBMzUmaJhJYXaclAxpGnP5vQL2A9+oQT2txPPsibN44vcShEFx+lDrNWLHMc4QMDqg/8zhWSlcIJYYfHxYKwZ2mUGiHcDSPghaDdfBiHf/hta4T1TCvI1kc5t9cVDJFLCyt+FinogG3iXfpzGdoQOiHbpCR0g4olbUK5cL8j2I8IOI1LmyhzEt7bs1wxqTtZI1vbEc/8m1euJ5ejYsWKIrw==$aahPmFoXQn9+7ATZngl2L+okugStHz84rNyOwM66YwERRQUgGL6X2s5mhc+NGZU9FJAK9Shy1mioGOBcHP5w4rQVqq5sQY3taPnKXOe4METEHurNBlezeLHHhmljWsXGjsVg2UcjVz3USPh+l1Hz1QnYcCcTGCoU1euNKXiVFAKh74f5yfdPrcTTRiwaPKGU2sv8mNXxt5R7VI2VmqNKgDIXjI+zYIRys0xGHP9nHP84I1Y9IS20tzsEl289UMHpwFwO7ecKsUbthMeo6i1DM0jaG8OTg2zTBDW89N6cSXdtVhjQpMM69CFysgtzEthF2zvpxufCYDd5EKJNX204r8Q2gM9OuqplXFuYMFLWfoUMpBet5VS+P3ASxXqorElnrTbEi41erHBiU/2Te3TzERyNyOy/DkXHV9YGhAB9aYQVlN5N0/p297YflKMCh47L26mx1HVEQBIVRKIrG5iMYA2H1t21IXQjcZSMQvZCslu2c/gzoFl4lTZsbwZMMVNkQ2/kAQgTYIkTVv8Kf4E/8iZdmUx8SzjUYuKBjUH+uNmqHPuk+xSL7XrxWDFAJD2S1RMtu42sVhI6jxViOOyKTXE43pNLw/K48vcaLq4MNz3jPsAfGUXn6m4nnp5DO8/GIv22Ln2GNtwysC2CPvLx5xHgEq05EGCxx+7ZlVzWLhtkBmOnipbT8CObc0ahAvnsKbY2uTMxNlOlPaYsjPF4gbMP9F4PjQbntEnNZ3vMKdoTRCARazxUzfnxmdBbRJ2F4ZTP9dKkxdLhePhc',
                // TODO end
                requestId: callbackObj.uuid // Pass id of request
            }
        ).then((data: BinLookupResponseRaw) => {
            // If response is the one we were waiting for...
            if (data?.requestId === this.currentRequestId) {
                //
                // TODO TESTing new synchrony plcc bins
                // data.brands = [
                //     // {
                //     //     brand: 'visa',
                //     //     cvcPolicy: 'required',
                //     //     enableLuhnCheck: true,
                //     //     showExpiryDate: true,
                //     //     supported: true
                //     // },
                //     // {
                //     //     brand: 'plcc',
                //     //     cvcPolicy: 'required',
                //     //     enableLuhnCheck: true,
                //     //     showExpiryDate: true,
                //     //     supported: true
                //     // }
                // PLCC card
                //     {
                //         brand: 'bcmc',
                //         cvcPolicy: 'required',
                //         enableLuhnCheck: false,
                //         showExpiryDate: false,
                //         supported: true
                //     }
                // ];
                // // TODO end

                if (data.brands?.length) {
                    const mappedResponse = data.brands.reduce(
                        (acc, item) => {
                            // All brand strings end up in the detectedBrands array
                            acc.detectedBrands.push(item.brand);

                            // Add supported brand objects to the supportedBrands array
                            if (item.supported === true) {
                                /**
                                 * NOTE we are currently using item.enableLuhnCheck === false as an indicator of a PLCC - this could/should change in the future
                                 */
                                // Add PLCCs to the front of the array so their icons are displayed first
                                const action = item.enableLuhnCheck === false ? 'unshift' : 'push';
                                acc.supportedBrands[action](item);

                                return acc;
                            }

                            return acc;
                        },
                        { supportedBrands: [], detectedBrands: [] }
                    );

                    /**
                     * supportedBrands = merchant supports this brand(s); we have detected the card number to be of this brand(s); carry on!
                     */
                    if (mappedResponse.supportedBrands.length) {
                        // ...call processBinLookupResponse with, a simplified, response object if it contains at least one supported brand
                        this.processBinLookupResponse({
                            issuingCountryCode: data.issuingCountryCode,
                            supportedBrands: mappedResponse.supportedBrands
                        } as BinLookupResponse);

                        // Inform merchant of the result
                        this.props.onBinLookup({
                            type: callbackObj.type,
                            detectedBrands: mappedResponse.detectedBrands,
                            supportedBrands: mappedResponse.supportedBrands.map(item => item.brand), // supportedBrands contains the subset of this.props.brands that matches the card number that the shopper has typed
                            brands: this.props.brands || DEFAULT_CARD_GROUP_TYPES
                        } as CbObjOnBinLookup);

                        return;
                    }

                    /**
                     * detectedBrands = no brands the merchant supports were found; what we did detect the shopper to be entering was this brand; error!
                     */
                    if (mappedResponse.detectedBrands.length) {
                        const errObj: CbObjOnError = {
                            type: 'card',
                            fieldType: 'encryptedCardNumber',
                            error: getError(ERROR_MSG_UNSUPPORTED_CARD_ENTERED),
                            detectedBrands: mappedResponse.detectedBrands
                        };
                        this.handleUnsupportedCard(errObj);

                        // Inform merchant of the result
                        this.props.onBinLookup({
                            type: callbackObj.type,
                            detectedBrands: mappedResponse.detectedBrands,
                            supportedBrands: null,
                            brands: this.props.brands || DEFAULT_CARD_GROUP_TYPES
                        } as CbObjOnBinLookup);

                        return;
                    }
                } else {
                    /**
                     *  BIN not in DB (a failed lookup will just contain a requestId)
                     */
                    this.props.onBinLookup({
                        type: callbackObj.type,
                        detectedBrands: null,
                        supportedBrands: null,
                        brands: this.props.brands || DEFAULT_CARD_GROUP_TYPES
                    } as CbObjOnBinLookup);
                }
            } else {
                // Some other kind of error on the backend
                this.props.onError(data || { errorType: 'binLookup', message: 'unknownError' });
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
