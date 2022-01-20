import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../configuration/constants';
import postMessageToIframe from '../../core/utils/iframes/postMessageToIframe';
import { objectsDeepEqual } from '../../utilities/commonUtils';
import { BrandStorageObject, CbObjOnBrand, SFFeedbackObj } from '../../types';
import { pick } from '../../../utils';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';

const checkForBrandChange = (pBrand: BrandStorageObject, storedBrand: BrandStorageObject): boolean => {
    // if the objects aren't the same - then return true = brandChange has happened
    return !objectsDeepEqual(pBrand, storedBrand);
};

/**
 * - If generic card type AND passed brand doesn't equal stored brand - send the new brand to the cvc input
 *    (so it can reassess what length it should be and if any value it contains is now valid)
 *
 * - Create object for onBrand callback aka SFPHandlers.handleOnBrand
 */
export default function processBrand(pFeedbackObj: SFFeedbackObj): boolean {
    const fieldType: string = pFeedbackObj.fieldType;

    if (fieldType === ENCRYPTED_CARD_NUMBER) {
        // Check for new brand...
        const newBrandObj: BrandStorageObject = {
            brand: pFeedbackObj.brand,
            cvcPolicy: pFeedbackObj.cvcPolicy,
            expiryDatePolicy: pFeedbackObj.expiryDatePolicy,
            showSocialSecurityNumber: pFeedbackObj.showSocialSecurityNumber
        };
        const newBrand: boolean = checkForBrandChange(newBrandObj, this.state.brand);

        if (!newBrand) {
            return null;
        }

        // Now BCMC can dual brand with Visa it must also be treated as a generic card so we can show/hide the CVC field
        const treatAsGenericCard: boolean = this.state.type === 'card' || this.state.type === 'bcmc';

        // ...if also a generic card - tell cvc field...
        if (treatAsGenericCard && newBrand) {
            // Store on state so for subsequent brand messages we can compare the new and the old
            this.state.brand = newBrandObj;

            // Perform postMessage to send brand to CVC field - this also needs to happen for BCMC, single branded cards,
            // because it needs to know the cvcPolicy (to set the aria-required attribute & to show the iframe)
            if (hasOwnProperty(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
                const dataObj: object = {
                    txVariant: this.state.type,
                    brand: newBrandObj.brand,
                    fieldType: ENCRYPTED_SECURITY_CODE,
                    cvcPolicy: pFeedbackObj.cvcPolicy,
                    numKey: this.state.securedFields[ENCRYPTED_SECURITY_CODE].numKey
                };
                postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_SECURITY_CODE), this.config.loadingContext);
            }
        }

        // Create object with brand related properties
        const brandInfoObj = treatAsGenericCard
            ? pick(['brand', 'cvcPolicy', 'cvcText', 'expiryDatePolicy', 'showSocialSecurityNumber']).from(pFeedbackObj)
            : null;

        if (brandInfoObj && brandInfoObj.brand) {
            const callbackObj: CbObjOnBrand = brandInfoObj as CbObjOnBrand;
            callbackObj.type = this.state.type;
            callbackObj.rootNode = this.props.rootNode;

            /// ...and call SFPHandlers.handleOnBrand
            this.callbacks.onBrand(callbackObj);
        }

        return true;
    }

    return false;
}
