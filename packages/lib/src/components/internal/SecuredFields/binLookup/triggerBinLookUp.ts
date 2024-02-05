import { httpPost } from '../../../../core/Services/http';
import { CbObjOnBinLookup, CbObjOnBinValue, CbObjOnError } from '../lib/types';
import { DEFAULT_CARD_GROUP_TYPES } from '../lib/configuration/constants';
import { getError } from '../../../../core/Errors/utils';
import { ERROR_MSG_UNSUPPORTED_CARD_ENTERED } from '../../../../core/Errors/constants';
import { BinLookupResponse, BinLookupResponseRaw } from '../../../Card/types';

if (process.env.NODE_ENV === 'development') {
    window.mockBinCount = 0; // Set to 0 to turn off mocking, 1 to turn it on
}

export default parent => {
    let currentRequestId = null;

    return (callbackObj: CbObjOnBinValue) => {
        // Allow way for merchant to disallow binLookup by specifically setting the prop to false
        if (parent.props.doBinLookup === false) {
            if (parent.props.onBinValue) parent.props.onBinValue(callbackObj);
            return;
        }

        // Do binLookup when encryptedBin property is present (and only if the merchant is using a clientKey)
        if (callbackObj.encryptedBin && parent.props.clientKey) {
            // Store id of request we're about to make
            currentRequestId = callbackObj.uuid;

            httpPost(
                {
                    loadingContext: parent.props.loadingContext,
                    path: `v3/bin/binLookup?token=${parent.props.clientKey}`
                },
                {
                    type: parent.props.brand,
                    supportedBrands: parent.props.brands || DEFAULT_CARD_GROUP_TYPES,
                    encryptedBin: callbackObj.encryptedBin,
                    requestId: callbackObj.uuid // Pass id of request
                }
            ).then((data: BinLookupResponseRaw) => {
                // If response is the one we were waiting for...
                if (data?.requestId === currentRequestId) {
                    if (process.env.NODE_ENV === 'development') {
                        // TODO mocking
                        if (window.mockBinCount >= 1) {
                            switch (window.mockBinCount) {
                                case 1:
                                    console.log('\n### triggerBinLookUp::mock first response:: ');
                                    data.brands = [
                                        {
                                            brand: 'mc',
                                            cvcPolicy: 'optional',
                                            enableLuhnCheck: true,
                                            // showExpiryDate: true, // deprecated in /binLookup v3
                                            expiryDatePolicy: 'optional',
                                            // panLength: 16,
                                            supported: true
                                        }
                                    ];
                                    // data.issuingCountryCode = 'KR'; // needed to mock korean_local_card
                                    // increment to alter second response
                                    window.mockBinCount++;

                                    break;
                                case 2:
                                    console.log('\n### triggerBinLookUp::mock second response:: ');
                                    // data.brands = null;
                                    data.brands = [
                                        {
                                            brand: 'maestro',
                                            cvcPolicy: 'required',
                                            enableLuhnCheck: true,
                                            showExpiryDate: true,
                                            supported: true,
                                            showSocialSecurityNumber: false
                                            // panLength: 16
                                        }
                                    ];
                                    break;
                                default:
                            }
                        }
                        // TODO end
                    }

                    if (data.brands?.length) {
                        const mappedResponse = data.brands.reduce(
                            (acc, item) => {
                                // All brand strings end up in the detectedBrands array
                                acc.detectedBrands.push(item.brand);
                                // Also add the paymentMethodVariants (more granular description of the txvariant)
                                acc.paymentMethodVariants.push(item.paymentMethodVariant);

                                // Add supported brand objects to the supportedBrands array
                                if (item.supported === true) {
                                    acc.supportedBrands.push(item);
                                    return acc;
                                }

                                return acc;
                            },
                            { supportedBrands: [], detectedBrands: [], paymentMethodVariants: [] }
                        );

                        /**
                         * supportedBrands = merchant supports this brand(s); we have detected the card number to be of this brand(s); carry on!
                         */
                        if (mappedResponse.supportedBrands.length) {
                            // ...call processBinLookupResponse with, a simplified, response object if it contains at least one supported brand
                            parent.processBinLookupResponse({
                                issuingCountryCode: data.issuingCountryCode,
                                supportedBrands: mappedResponse.supportedBrands,
                                ...(data.showSocialSecurityNumber ? { showSocialSecurityNumber: data.showSocialSecurityNumber } : {})
                            } as BinLookupResponse);

                            // Inform merchant of the result
                            parent.onBinLookup({
                                type: callbackObj.type,
                                detectedBrands: mappedResponse.detectedBrands,
                                // supportedBrands contains the subset of this.props.brands that matches the card number that the shopper has typed
                                supportedBrands: mappedResponse.supportedBrands.map(item => item.brand),
                                paymentMethodVariants: mappedResponse.paymentMethodVariants,
                                supportedBrandsRaw: mappedResponse.supportedBrands, // full supportedBrands data (for customCard comp)
                                brands: parent.props.brands || DEFAULT_CARD_GROUP_TYPES,
                                issuingCountryCode: data.issuingCountryCode
                            } as CbObjOnBinLookup);

                            return;
                        }

                        /**
                         * detectedBrands = no brands the merchant supports were found; what we did detect the shopper to be entering was this brand;
                         * error!
                         */
                        if (mappedResponse.detectedBrands.length) {
                            const errObj: CbObjOnError = {
                                type: 'card',
                                fieldType: 'encryptedCardNumber',
                                error: getError(ERROR_MSG_UNSUPPORTED_CARD_ENTERED),
                                detectedBrands: mappedResponse.detectedBrands
                            };
                            parent.handleUnsupportedCard(errObj);

                            // Inform merchant of the result
                            parent.onBinLookup({
                                type: callbackObj.type,
                                detectedBrands: mappedResponse.detectedBrands,
                                supportedBrands: null,
                                paymentMethodVariants: mappedResponse.paymentMethodVariants,
                                brands: parent.props.brands || DEFAULT_CARD_GROUP_TYPES
                            } as CbObjOnBinLookup);

                            return;
                        }
                    } else {
                        /**
                         *  BIN not in DB (a failed lookup will just contain a requestId)
                         */
                        parent.onBinLookup({
                            type: callbackObj.type,
                            detectedBrands: null,
                            supportedBrands: null,
                            paymentMethodVariants: null,
                            brands: parent.props.brands || DEFAULT_CARD_GROUP_TYPES
                        } as CbObjOnBinLookup);

                        // Reset the UI and let the native, regex branding happen (for the generic card)
                        // For a single-branded card we need to pass a boolean to prompt resetting the brand logo to the 'base' type
                        parent.processBinLookupResponse({}, true);
                    }
                } else {
                    if (!data?.requestId) {
                        // Some other kind of error on the backend
                        parent.props.onError(data || { errorType: 'binLookup', message: 'unknownError' });
                    }
                    // Else - response with wrong requestId
                }
            });
        } else if (currentRequestId) {
            /**
             * If onBinValue callback is called AND we have been doing binLookup BUT passed object doesn't have an encryptedBin property
             * - then THE NUMBER OF DIGITS IN NUMBER FIELD HAS DROPPED BELOW THRESHOLD for BIN lookup - so reset the UI
             */
            parent.processBinLookupResponse(null, true);

            currentRequestId = null; // Ignore any pending responses

            // Reset any errors
            const errObj: CbObjOnError = {
                type: 'card',
                fieldType: 'encryptedCardNumber',
                error: ''
            };
            parent.handleUnsupportedCard(errObj);

            // CustomCard needs this to reset the UI
            parent.onBinLookup({
                isReset: true
            } as CbObjOnBinLookup);
        }

        if (parent.props.onBinValue) parent.props.onBinValue(callbackObj);
    };
};
