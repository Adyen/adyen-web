import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../configuration/constants';
import postMessageToIframe from './iframes/postMessageToIframe';
import { existy } from '../../utilities/commonUtils';
import { CbObjOnBrand, SFFeedbackObj } from '../../types';
import * as logger from '../../utilities/logger';

interface BrandInfoObject {
    brand: string;
    hideCVC: boolean;
    cvcRequired: boolean;
    cvcText: string;
}

const noop = () => null;

// Adds brand related properties to the callback object
const setBrandRelatedInfo = (pFeedbackObj: SFFeedbackObj): BrandInfoObject => {
    const dataObj: BrandInfoObject = ({} as any) as BrandInfoObject;
    let hasProps = false;

    if (existy(pFeedbackObj.brand)) {
        dataObj.brand = pFeedbackObj.brand;
        hasProps = true;
    }

    // hasOwnProperty call covers scenario where pFeedbackObj doesn't exist
    if (Object.prototype.hasOwnProperty.call(pFeedbackObj, 'cvcText')) {
        dataObj.cvcText = pFeedbackObj.cvcText;
        hasProps = true;
    }

    if (Object.prototype.hasOwnProperty.call(pFeedbackObj, 'cvcRequired')) {
        dataObj.cvcRequired = pFeedbackObj.cvcRequired;
        hasProps = true;
    }

    if (Object.prototype.hasOwnProperty.call(pFeedbackObj, 'hideCVC')) {
        dataObj.hideCVC = pFeedbackObj.hideCVC;
        hasProps = true;
    }

    return hasProps ? dataObj : null;
};

// If brand sent with feedbackObj doesn't equal stored brand - extract the new brand ready to send to the cvc field
const checkForBrandChange = (pBrand: string, storedBrand: string): string => {
    if (pBrand && pBrand !== storedBrand) {
        if (process.env.NODE_ENV === 'development' && window._b$dl) {
            logger.log(
                '\n### checkoutSecuredFields_handleSF::__checkForBrandChange:: Brand Change! new brand=',
                pBrand,
                '---- old brand=',
                storedBrand
            );
        }

        return pBrand;
    }
    return '';
};

// If generic card type AND passed brand doesn't equal stored brand - send the new brand to the cvc input
// Create object for CSF Brand Callback fn with image & text details
export function handleProcessBrand(pFeedbackObj: SFFeedbackObj): BrandInfoObject {
    let brandInfoObj: BrandInfoObject;

    const fieldType: string = pFeedbackObj.fieldType;

    if (fieldType === ENCRYPTED_CARD_NUMBER) {
        // Check for new brand...
        const newBrand: string = checkForBrandChange(pFeedbackObj.brand, this.state.brand);

        if (!newBrand.length) {
            return null;
        }

        const isGenericCard: boolean = this.state.type === 'card';

        // ...if also a generic card - tell cvc field & number field...
        if (isGenericCard && newBrand) {
            this.state.brand = newBrand;

            const baseDataObj: object = {
                txVariant: this.state.type,
                brand: newBrand
            };

            // Perform postMessage to send brand on specified (CVC) field
            if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
                const dataObj: object = {
                    ...baseDataObj,
                    ...{
                        fieldType: ENCRYPTED_SECURITY_CODE,
                        hideCVC: pFeedbackObj.hideCVC,
                        cvcRequired: pFeedbackObj.cvcRequired,
                        numKey: this.state.securedFields[ENCRYPTED_SECURITY_CODE].numKey
                    }
                };
                postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_SECURITY_CODE), this.config.loadingContext);
            }
        }

        // Check for brand related properties
        brandInfoObj = isGenericCard ? setBrandRelatedInfo(pFeedbackObj) : noop();

        // Return object to send to Callback fn
        if (brandInfoObj) {
            const callbackObj: CbObjOnBrand = brandInfoObj as CbObjOnBrand;
            callbackObj.type = this.state.type;
            callbackObj.rootNode = this.props.rootNode;

            this.callbacks.onBrand(callbackObj);
        }

        return brandInfoObj;
    }

    return null;
}
