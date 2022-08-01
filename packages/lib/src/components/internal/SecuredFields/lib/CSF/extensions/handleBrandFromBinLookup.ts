import {
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_CARD_NUMBER,
    DATE_POLICY_REQUIRED,
    DATE_POLICY_HIDDEN,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR
} from '../../configuration/constants';
import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { SFFeedbackObj, SendBrandObject, SendExpiryDateObject } from '../../types';
import { BinLookupResponse, BrandObject } from '../../../../../Card/types';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';
import getIframeContentWin from '../utils/iframes/getIframeContentWin';
import { SingleBrandResetObject } from '../../../SFP/types';

export function sendBrandToCardSF(brandObj: SendBrandObject): void {
    if (hasOwnProperty(this.state.securedFields, ENCRYPTED_CARD_NUMBER)) {
        const dataObj: object = {
            txVariant: this.state.type,
            ...brandObj,
            fieldType: ENCRYPTED_CARD_NUMBER,
            numKey: this.state.securedFields[ENCRYPTED_CARD_NUMBER].numKey
        };
        postMessageToIframe(dataObj, getIframeContentWin(this.state, ENCRYPTED_CARD_NUMBER), this.config.loadingContext);
    }
}

export function sendExpiryDatePolicyToSF(expiryDateObj: SendExpiryDateObject): void {
    const separateDateFields =
        hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_MONTH) && hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_YEAR);

    const dateIframesArr = separateDateFields ? [ENCRYPTED_EXPIRY_MONTH, ENCRYPTED_EXPIRY_YEAR] : [ENCRYPTED_EXPIRY_DATE];

    dateIframesArr.forEach((key: string) => {
        const dataObj: object = {
            txVariant: this.state.type,
            ...expiryDateObj,
            fieldType: key,
            numKey: this.state.securedFields[key].numKey
        };
        postMessageToIframe(dataObj, getIframeContentWin(this.state, key), this.config.loadingContext);
    });
}

export default function handleBrandFromBinLookup(binLookupResponse: BinLookupResponse, resetObj: SingleBrandResetObject): void {
    const isGenericCard: boolean = this.state.type === 'card';

    /**
     * The number of digits in number field has dropped below threshold for BIN lookup (or the bin wasn't found in the DB)
     * - so tell SF to reset & republish the brand it detects
     */
    if (!binLookupResponse || !Object.keys(binLookupResponse).length) {
        if (isGenericCard) {
            // This will be sent to CardNumber SF which will trigger the brand to be re-evaluated and broadcast (which will reset cvcPolicy)
            this.sendBrandToCardSF({ brand: 'reset' });
            this.sendExpiryDatePolicyToSF({ expiryDatePolicy: DATE_POLICY_REQUIRED });
        } else {
            /**
             * For "dedicated" card components, i.e a card component created as: checkout.create('bcmc') but which can accept multiple brands,
             * there will be no to-and-fro with the securedField iframe to reset brand.
             * The presence of a resetObj indicates we are in this "dedicated"" scenario, so we need to use the information contained within this object
             * to internally reset the brand
             */
            if (resetObj) {
                this.processBrand({ ...resetObj, fieldType: ENCRYPTED_CARD_NUMBER } as SFFeedbackObj);
            }
        }

        // Reset expiryDatePolicy - which never comes from SF
        if (this.state.type === 'card' && hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_DATE)) {
            this.state.securedFields[ENCRYPTED_EXPIRY_DATE].expiryDatePolicy = DATE_POLICY_REQUIRED;
        }

        return;
    }

    const binBrandObj: BrandObject = binLookupResponse.supportedBrands[0];

    const passedBrand: string = binBrandObj.brand;

    // Look first for expiryDatePolicy string otherwise use showExpiryDate boolean
    const expiryDatePolicy = binBrandObj.expiryDatePolicy ?? (binBrandObj.showExpiryDate === true ? DATE_POLICY_REQUIRED : DATE_POLICY_HIDDEN);

    const brandObj: object = {
        brand: passedBrand,
        cvcPolicy: binBrandObj.cvcPolicy,
        expiryDatePolicy,
        cvcText: 'Security code',
        showSocialSecurityNumber: binBrandObj.showSocialSecurityNumber ?? false,
        fieldType: ENCRYPTED_CARD_NUMBER
    };

    // Take advantage of function used to handle brand messages from SF in order to process this new brand information
    this.processBrand(brandObj as SFFeedbackObj);

    if (isGenericCard) {
        // Pass brand to CardNumber SF
        const cardObj: SendBrandObject = {
            brand: passedBrand,
            enableLuhnCheck: binLookupResponse.supportedBrands[0].enableLuhnCheck !== false,
            ...(binBrandObj?.panLength && { panLength: binBrandObj?.panLength })
        };
        this.sendBrandToCardSF(cardObj);

        // Inform the date related securedFields
        // - if expiryDatePolicy is 'optional' or 'hidden' they need to set the aria-required attribute / hide themselves
        this.sendExpiryDatePolicyToSF({ expiryDatePolicy });
    }

    /**
     * CHECK IF BRAND CHANGE MEANS FORM IS NOW VALID e.g maestro/bcmc (which don't require cvc) OR bcmc/visa (one of which doesn't require cvc, one of which does)
     */

    /**
     * First set the cvcPolicy value on the relevant SecuredFields instance (which will reflect in the cvc field being considered valid,
     *  as long as it is not in error)...
     */
    if (hasOwnProperty(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
        this.state.securedFields[ENCRYPTED_SECURITY_CODE].cvcPolicy = binBrandObj.cvcPolicy;
    }

    /**
     * ...then set the expiryDatePolicy...
     */
    if (hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_DATE)) {
        this.state.securedFields[ENCRYPTED_EXPIRY_DATE].expiryDatePolicy = expiryDatePolicy;
    } else if (hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_MONTH) && hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_YEAR)) {
        this.state.securedFields[ENCRYPTED_EXPIRY_MONTH].expiryDatePolicy = expiryDatePolicy;
        this.state.securedFields[ENCRYPTED_EXPIRY_YEAR].expiryDatePolicy = expiryDatePolicy;
    }

    /**
     * ...and now re-check if form i.e all the SecuredFields, are valid
     */
    this.validateForm();
}
