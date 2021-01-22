import { ENCRYPTED_SECURITY_CODE, ENCRYPTED_CARD_NUMBER } from '../../configuration/constants';
import postMessageToIframe from './iframes/postMessageToIframe';
import { SFFeedbackObj, SendBrandObject } from '../../types';
import { BinLookupObject, BrandObject } from '../../../../../Card/types';

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

export function handleBrandFromBinLookup(binLookupObject: BinLookupObject): void {
    // The number of digits in number field has dropped below threshold for BIN lookup - so tell SF to reset & republish the brand it detects
    if (!binLookupObject) {
        this.sendBrandToCardSF({ brand: 'reset' });
        return;
    }

    const binBrandObj: BrandObject = binLookupObject.supportedBrands[0];

    const passedBrand: string = binBrandObj.brand;

    const hideCVC: boolean = binBrandObj.cvcPolicy === 'hidden';
    const cvcRequired: boolean = hideCVC || binBrandObj.cvcPolicy === 'optional' ? false : true;

    const brandObj: object = {
        cvcRequired,
        brand: passedBrand,
        hideCVC,
        cvcText: 'Security code',
        fieldType: ENCRYPTED_CARD_NUMBER
    };

    this.processBrand(brandObj as SFFeedbackObj);

    // Pass brand to CardNumber SF
    this.sendBrandToCardSF({ brand: passedBrand, enableLuhnCheck: !(binLookupObject.supportedBrands[0].enableLuhnCheck === false) });

    /**
     * CHECK IF BRAND CHANGE MEANS FORM IS NOW VALID e.g maestro/bcmc (which don't require cvc)
     * Set the cvcRequired value on the relevant SecuredFields instance...
     * ...which will reflect in the cvc field being considered valid, as long as it is not in error...
     */
    if (this.state.type === 'card' && Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
        this.state.securedFields[ENCRYPTED_SECURITY_CODE].cvcRequired = cvcRequired;
    }

    // ... and re-check if all SecuredFields are valid
    this.assessFormValidity();
}
