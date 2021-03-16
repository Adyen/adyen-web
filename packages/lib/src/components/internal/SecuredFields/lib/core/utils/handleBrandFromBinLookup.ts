import {
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_CARD_NUMBER,
    DATE_POLICY_REQUIRED,
    DATE_POLICY_HIDDEN,
    ENCRYPTED_EXPIRY_DATE
} from '../../configuration/constants';
import postMessageToIframe from './iframes/postMessageToIframe';
import { SFFeedbackObj, SendBrandObject } from '../../types';
import { BinLookupResponse, BrandObject } from '../../../../../Card/types';

export function sendBrandToCardSF(brandObj: SendBrandObject): void {
    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_CARD_NUMBER)) {
        const dataObj: object = {
            txVariant: this.state.type,
            ...brandObj,
            fieldType: ENCRYPTED_CARD_NUMBER,
            numKey: this.state.securedFields[ENCRYPTED_CARD_NUMBER].numKey
        };
        postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_CARD_NUMBER), this.config.loadingContext);
    }
}

export function handleBrandFromBinLookup(binLookupResponse: BinLookupResponse): void {
    // The number of digits in number field has dropped below threshold for BIN lookup - so tell SF to reset & republish the brand it detects
    if (!binLookupResponse) {
        // This will be sent to CardNumber SF which will trigger the brand to be re-evaluated and broadcast (which will reset cvcPolicy)
        this.sendBrandToCardSF({ brand: 'reset' });

        // Reset datePolicy - which never comes from SF
        if (this.state.type === 'card' && Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_EXPIRY_DATE)) {
            this.state.securedFields[ENCRYPTED_EXPIRY_DATE].datePolicy = DATE_POLICY_REQUIRED;
        }
        return;
    }

    const binBrandObj: BrandObject = binLookupResponse.supportedBrands[0];

    const passedBrand: string = binBrandObj.brand;

    const datePolicy = binBrandObj.showExpiryDate === true ? DATE_POLICY_REQUIRED : DATE_POLICY_HIDDEN;

    const brandObj: object = {
        brand: passedBrand,
        cvcPolicy: binBrandObj.cvcPolicy,
        datePolicy,
        cvcText: 'Security code',
        fieldType: ENCRYPTED_CARD_NUMBER
    };

    this.processBrand(brandObj as SFFeedbackObj);

    // Pass brand to CardNumber SF
    this.sendBrandToCardSF({
        brand: passedBrand,
        enableLuhnCheck: binLookupResponse.supportedBrands[0].enableLuhnCheck !== false
    });

    /**
     * CHECK IF BRAND CHANGE MEANS FORM IS NOW VALID e.g maestro/bcmc (which don't require cvc) OR bcmc/visa (one of which doesn't require cvc, one of which does)
     */

    /**
     * Set the cvcPolicy value on the relevant SecuredFields instance (which will reflect in the cvc field being considered valid,
     *  as long as it is not in error)...
     */
    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
        this.state.securedFields[ENCRYPTED_SECURITY_CODE].cvcPolicy = binBrandObj.cvcPolicy;
    }

    /**
     * ...and set the datePolicy...
     */
    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_EXPIRY_DATE)) {
        this.state.securedFields[ENCRYPTED_EXPIRY_DATE].datePolicy = datePolicy;
    }

    /**
     * ...and re-check if all SecuredFields are valid
     */
    this.assessFormValidity();
}
