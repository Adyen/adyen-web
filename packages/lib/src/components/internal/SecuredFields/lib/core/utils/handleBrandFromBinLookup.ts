import { ENCRYPTED_SECURITY_CODE, ENCRYPTED_CARD_NUMBER } from '../../configuration/constants';
import { existy } from '../../utilities/commonUtils';
import cardType from '../../utilities/cardType';
import postMessageToIframe from './iframes/postMessageToIframe';
import { BinLookupObject, CardObject, SFFeedbackObj } from '../../types';

export function sendBrandToCardSF(brand: string): void {
    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_CARD_NUMBER)) {
        const dataObj: object = {
            txVariant: this.state.type,
            brand,
            fieldType: ENCRYPTED_CARD_NUMBER,
            numKey: this.state.securedFields[ENCRYPTED_CARD_NUMBER].numKey
        };
        postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_CARD_NUMBER), this.config.loadingContext);
    }
}

export function handleBrandFromBinLookup(brandsObj: BinLookupObject): void {
    // The number of digits in number field has dropped below threshold for BIN lookup - so tell SF to reset & republish the brand it detects
    if (!brandsObj) {
        this.sendBrandToCardSF('reset');
        return;
    }

    const passedBrand: string = brandsObj.supportedBrands[0];

    const card: CardObject = cardType.getCardByBrand(passedBrand);

    // If no card object force it to true, else base it on the value in the card object
    const cvcRequired: boolean = !existy(card) ? true : !(card.cvcRequired === false);

    // Create brand object to send to processBrand (& so handle brand change in the same way as if it had come from securedFields)
    const brandObj: object = {
        cvcRequired,
        brand: passedBrand,
        hideCVC: !existy(card) ? false : card.hideCVC === true, // If no card object: force to false
        cvcText: existy(card) && card.securityCode ? card.securityCode : 'Security code',
        fieldType: ENCRYPTED_CARD_NUMBER
    };

    this.processBrand(brandObj as SFFeedbackObj);

    // Pass brand to CardNumber SF
    this.sendBrandToCardSF(passedBrand);

    // CHECK IF BRAND CHANGE MEANS FORM IS NOW VALID e.g maestro/bcmc (which don't require cvc)
    // Set the cvcRequired value on the relevant SecuredFields instance...
    if (this.state.type === 'card' && Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
        this.state.securedFields[ENCRYPTED_SECURITY_CODE].cvcRequired = cvcRequired;
    }
    // ... and re-check if all SecuredFields are valid
    this.assessFormValidity();
}
