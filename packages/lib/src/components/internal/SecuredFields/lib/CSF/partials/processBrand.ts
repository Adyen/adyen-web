import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../constants';
import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { objectsDeepEqual } from '../../utilities/commonUtils';
import { BrandStorageObject, CbObjOnBrand, SFFeedbackObj, SFFieldType } from '../../types';
import { pick } from '../../../utils';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';
import getIframeContentWin from '../utils/iframes/getIframeContentWin';
import { CSFThisObject } from '../types';

const checkForBrandChange = (pBrand: BrandStorageObject, storedBrand: BrandStorageObject): boolean => {
    // if the objects aren't the same - then return true = brandChange has happened
    return !objectsDeepEqual(pBrand, storedBrand);
};

/**
 * - If generic card type AND passed brand doesn't equal stored brand - send the new brand to the cvc input
 *    (so it can reassess what length it should be and if any value it contains is now valid)
 *
 * - Create object for onBrand callback aka SFPHandlers.handleOnBrand
 *
 * @param csfState - comes from initial, partial, implementation
 * @param csfConfig - comes from initial, partial, implementation
 * @param csfProps - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 *
 * @param pFeedbackObj -
 */
export default function processBrand({ csfState, csfConfig, csfProps, csfCallbacks }: CSFThisObject, pFeedbackObj: SFFeedbackObj): boolean {
    const fieldType: SFFieldType = pFeedbackObj.fieldType;

    if (fieldType === ENCRYPTED_CARD_NUMBER) {
        // Check for new brand...
        const newBrandObj: BrandStorageObject = {
            brand: pFeedbackObj.brand,
            cvcPolicy: pFeedbackObj.cvcPolicy,
            expiryDatePolicy: pFeedbackObj.expiryDatePolicy,
            showSocialSecurityNumber: pFeedbackObj.showSocialSecurityNumber
        };
        const newBrand: boolean = checkForBrandChange(newBrandObj, csfState.brand);

        if (!newBrand) {
            return null;
        }

        // Now BCMC can dual brand with Visa it must also be treated as a generic card so we can show/hide the CVC field
        const treatAsGenericCard: boolean = csfState.type === 'card' || csfState.type === 'bcmc';

        // ...if also a generic card - tell cvc field...
        if (treatAsGenericCard && newBrand) {
            // Store on state so for subsequent brand messages we can compare the new and the old
            csfState.brand = newBrandObj;

            // Perform postMessage to send brand to CVC field - this also needs to happen for BCMC, single branded cards,
            // because it needs to know the cvcPolicy (to set the aria-required attribute & to show the iframe)
            if (hasOwnProperty(csfState.securedFields, ENCRYPTED_SECURITY_CODE)) {
                const dataObj: object = {
                    txVariant: csfState.type,
                    brand: newBrandObj.brand,
                    fieldType: ENCRYPTED_SECURITY_CODE,
                    cvcPolicy: pFeedbackObj.cvcPolicy,
                    numKey: csfState.securedFields[ENCRYPTED_SECURITY_CODE].numKey
                };
                postMessageToIframe(dataObj, getIframeContentWin(csfState, ENCRYPTED_SECURITY_CODE), csfConfig.loadingContext);
            }
        }

        // Create object with brand related properties
        const brandInfoObj = treatAsGenericCard
            ? pick(['brand', 'cvcPolicy', 'cvcText', 'expiryDatePolicy', 'showSocialSecurityNumber']).from(pFeedbackObj)
            : null;

        if (brandInfoObj && brandInfoObj.brand) {
            const callbackObj: CbObjOnBrand = brandInfoObj as CbObjOnBrand;
            callbackObj.type = csfState.type;
            callbackObj.rootNode = csfProps.rootNode as HTMLElement;

            // ...and call SFPHandlers.handleOnBrand
            csfCallbacks.onBrand(callbackObj);
        }

        return true;
    }

    return false;
}
