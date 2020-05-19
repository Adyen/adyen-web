import { HOSTED_CVC_FIELD, HOSTED_NUMBER_FIELD } from '../../configuration/constants';
import { existy } from '../../utilities/commonUtils';
import cardType from '../../utilities/cardType';
import postMessageToIframe from './iframes/postMessageToIframe';
import { BinLookupObject, CardObject, SFFeedbackObj } from '~/components/internal/SecuredFields/lib/types';

export function sendBrandToCardSF(brand: string): void {
    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, HOSTED_NUMBER_FIELD)) {
        const dataObj: object = {
            txVariant: this.state.type,
            brand,
            fieldType: HOSTED_NUMBER_FIELD,
            numKey: this.state.securedFields[HOSTED_NUMBER_FIELD].numKey
        };
        postMessageToIframe(dataObj, this.getIframeContentWin(HOSTED_NUMBER_FIELD), this.config.loadingContext);
    }
}

export function handleBrandFromBinLookup(brandsObj: BinLookupObject): void {
    // The number of digits in number field has dropped below threshold for BIN lookup - so tell SF to reset & republish the brand it detects
    if (!brandsObj) {
        this.sendBrandToCardSF('reset');
        return;
    }

    const passedBrand: string = brandsObj.brands[0];

    const card: CardObject = cardType.getCardByBrand(passedBrand);

    // If no card object force it to true, else base it on the value in the card object
    const cvcRequired: boolean = !existy(card) ? true : !(card.cvcRequired === false);

    const brandToSend: string = card ? passedBrand : 'card';

    // Create brand object to send to processBrand (& so handle brand change in the same way as if it had come from securedFields)
    const brandObj: object = {
        cvcRequired,
        brand: brandToSend,
        hideCVC: !existy(card) ? false : card.hideCVC === true, // If no card object: force to false
        cvcText: existy(card) && card.securityCode ? card.securityCode : 'Security code',
        fieldType: HOSTED_NUMBER_FIELD
    };

    this.processBrand(brandObj as SFFeedbackObj);

    // Pass brand to CardNumber SF
    this.sendBrandToCardSF(brandToSend);

    // CHECK IF BRAND CHANGE MEANS FORM IS NOW VALID e.g maestro/bcmc
    // Set the cvcRequired value on the relevant SecuredFields instance...
    if (this.state.type === 'card' && Object.prototype.hasOwnProperty.call(this.state.securedFields, HOSTED_CVC_FIELD)) {
        this.state.securedFields[HOSTED_CVC_FIELD].cvcRequired = cvcRequired;
    }
    // ... and re-check if all SecuredFields are valid
    this.assessFormValidity();
}
