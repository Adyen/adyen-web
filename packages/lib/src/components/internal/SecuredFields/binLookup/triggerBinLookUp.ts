import { httpPost } from '../../../../core/Services/http';
import { CbObjOnBinLookup, CbObjOnBinValue, CbObjOnError } from '../lib/types';
import { DEFAULT_CARD_GROUP_TYPES } from '../lib/configuration/constants';
import { getError } from '../../../../core/Errors/utils';
import { ERROR_MSG_UNSUPPORTED_CARD_ENTERED } from '../../../../core/Errors/constants';
import { BinLookupResponse, BinLookupResponseRaw } from '../../../Card/types';
import { sortBrandsAccordingToRules } from './sortBinLookupBrands';

export default parent => {
    let currentRequestId = null;

    /* eslint-disable-next-line prefer-const */
    let mockBinCount = 0; // Set to 0 to turn off mocking, 1 to turn it on

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
                    path: `v2/bin/binLookup?token=${parent.props.clientKey}`
                },
                {
                    supportedBrands: parent.props.brands || DEFAULT_CARD_GROUP_TYPES,
                    encryptedBin: callbackObj.encryptedBin,
                    // TODO - need for testing local SFs
                    /* prettier-ignore */
                    // encryptedBin:
                    // 'adyenjs_0_1_25$Fo8EBVzB482iuYdY2Pw02RziqyxhlrabgTDtIwOQSivLV6onNyoNo++0qfddZIFojbL4j4JOEfmYms8KIu3+IKBPs/HBepglGn80JLlN4GYRQnFQBeKeW49w2cagDLJRCxvQEEHfsOJuI44OPFx0lsOsw99PoI1KPMIKvPo0pmQ7LiZJC5bVLSRWmOSqEVMBQZ+y50wz0wwIF/CYYHUCjh5L5kuw1BHbHDyDdhL+/V5eci++0flo+oE2gB2LKawzmqmRx93j3HYwMAnMiC+hddiYxYZd134YLkfcS0Ld6ynoo8GHgbyG07YXUPskO2soM5Jw9frPq4a2ek331zIZAw==$pn70T6q6rW2cpmUWHt/7ZVECi20hmpV0iowVr+rAxNTM+L8Rs668jlMb2UXjr2+9JfLTNakWFddMcMCmamcow0OGOf8oeaZMGlFIoqia+qgVTwmiKPeRdSnFZiF0RGokEgnfMK/w+JoV6Rw1NnSG6govrjPi2uC0qqgaYgDWmpGa0n8RborvkhRuL/m8dFs0qVN8pJkLIEgupIv05jhkrFfTvGoPC+Guzc+YkfqC8oa/EkmLFZBg6Ps/g1P+k7sLhQl4osViiLRaASju+d1dZcCaZCX5BWydvcRIPRcVg5DCj4wtXUNxYd+oCbomLPTQhrb8N0fptCvT01IXXxfUDvyX4nxSpWxO6fkot+D9S2Q3V2Za/wykMapL0kQdBNNzK2FjwEZOXJOOQ9hfW8rl5oR/Co8Rphm+eOL2HzyE9eWmA8W8IHxxdZ0XcOGf1KDTq9pn+H0ZWwvJwo2EmeXgCurtti/haoof6CdOLf5fmWpzonsKzbG/e+iFpCAyjINi3mw3ri/mAxZFJJj70bY6dylG5JZm9y4PcS1A0hHFkFje4J00l1yKDwwDTzvhes+VwaRfyBlz38Sp08zhxD5qK5fa+PgaaL2/c8ol9xf6wK46xtEIWGxHseGMo0aF49sGilpRJ857beyqe66/AuThWifbqvBSxzppFwV9fkBU9IefzjD/kKOJRUCm10iwAHvzZOFyLyyBh67tQJemdNTQkui1n/Ts6NyF8lAs2jdYPuof9dXJaT68qRx2+TwmnZN+Xi9npa8LWRX6DI1cuCv/BQqOiPCaS3ZLIU6ltUNd',
                    // end TODO
                    requestId: callbackObj.uuid // Pass id of request
                }
            ).then((data: BinLookupResponseRaw) => {
                // If response is the one we were waiting for...
                if (data?.requestId === currentRequestId) {
                    // TODO mocking
                    if (mockBinCount >= 1) {
                        switch (mockBinCount) {
                            case 1:
                                console.log('\n### triggerBinLookUp::mock first response:: ');
                                data.brands = [
                                    // {
                                    //     brand: 'bcmc',
                                    //     cvcPolicy: 'hidden',
                                    //     enableLuhnCheck: true,
                                    //     showExpiryDate: true,
                                    //     supported: true
                                    // },
                                    // {
                                    //     brand: 'visa',
                                    //     cvcPolicy: 'required',
                                    //     enableLuhnCheck: true,
                                    //     showExpiryDate: true,
                                    //     supported: true,
                                    //     showSocialSecurityNumber: true
                                    // }
                                    {
                                        brand: 'mc',
                                        cvcPolicy: 'required',
                                        enableLuhnCheck: true,
                                        showExpiryDate: true,
                                        supported: false
                                    }
                                ];
                                // increment to alter second response
                                mockBinCount++;

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
                                    }
                                    // {
                                    //     brand: 'cartebancaire',
                                    //     cvcPolicy: 'required',
                                    //     enableLuhnCheck: true,
                                    //     showExpiryDate: false,
                                    //     supported: true
                                    // }
                                ];
                                break;
                            default:
                        }
                    }
                    // TODO end

                    if (data.brands?.length) {
                        // Sort brands according to rules
                        const sortedBrands = data.brands.length === 2 ? sortBrandsAccordingToRules(data.brands, parent.props.type) : data.brands;

                        const mappedResponse = sortedBrands.reduce(
                            (acc, item) => {
                                // All brand strings end up in the detectedBrands array
                                acc.detectedBrands.push(item.brand);

                                // Add supported brand objects to the supportedBrands array
                                if (item.supported === true) {
                                    acc.supportedBrands.push(item);
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
                            parent.processBinLookupResponse({
                                issuingCountryCode: data.issuingCountryCode,
                                supportedBrands: mappedResponse.supportedBrands,
                                ...(data.showSocialSecurityNumber ? { showSocialSecurityNumber: data.showSocialSecurityNumber } : {})
                            } as BinLookupResponse);

                            // Inform merchant of the result
                            parent.onBinLookup({
                                type: callbackObj.type,
                                detectedBrands: mappedResponse.detectedBrands,
                                supportedBrands: mappedResponse.supportedBrands.map(item => item.brand), // supportedBrands contains the subset of
                                // this.props.brands that matches the card
                                // number that the shopper has typed
                                supportedBrandsRaw: mappedResponse.supportedBrands, // full supportedBrands data (for customCard comp)
                                brands: parent.props.brands || DEFAULT_CARD_GROUP_TYPES
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
