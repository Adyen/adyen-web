import { CVC_POLICY_HIDDEN, CVC_POLICY_REQUIRED, ENCRYPTED_CARD_NUMBER, ENCRYPTED_SECURITY_CODE } from '../../configuration/constants';
import postMessageToIframe from './iframes/postMessageToIframe';
import { existy, getCVCPolicy, objectsDeepEqual } from '../../utilities/commonUtils';
import { BrandStorageObject, CbObjOnBrand, SFFeedbackObj } from '../../types';
import { CVCPolicyType } from '../AbstractSecuredField';

interface BrandInfoObject {
    brand: string;
    cvcPolicy: CVCPolicyType;
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

    if (Object.prototype.hasOwnProperty.call(pFeedbackObj, 'cvcPolicy')) {
        dataObj.cvcPolicy = pFeedbackObj.cvcPolicy;
        hasProps = true;
    }

    return hasProps ? dataObj : null;
};

const checkForBrandChange = (pBrand: BrandStorageObject, storedBrand: BrandStorageObject): boolean => {
    // if the objects aren't the same - then return true = brandChange has happened
    return !objectsDeepEqual(pBrand, storedBrand);
};

// If generic card type AND passed brand doesn't equal stored brand - send the new brand to the cvc input
// Create object for onBrand callback
export function handleProcessBrand(pFeedbackObj: SFFeedbackObj): BrandInfoObject {
    let brandInfoObj: BrandInfoObject;

    // console.log('### processBrand::handleProcessBrand:: pFeedbackObj=', pFeedbackObj);

    const fieldType: string = pFeedbackObj.fieldType;

    if (fieldType === ENCRYPTED_CARD_NUMBER) {
        // Check for new brand...
        const newBrandObj: BrandStorageObject = {
            brand: pFeedbackObj.brand,
            cvcPolicy: pFeedbackObj.cvcPolicy ? pFeedbackObj.cvcPolicy : getCVCPolicy(pFeedbackObj)
        };
        const newBrand: boolean = checkForBrandChange(newBrandObj, this.state.brand);

        if (!newBrand) {
            return null;
        }

        const isGenericCard: boolean = this.state.type === 'card';

        // ...if also a generic card - tell cvc field & number field...
        if (isGenericCard && newBrand) {
            this.state.brand = newBrandObj;
            // console.log('### processBrand::handleProcessBrand:: this.state.brand', this.state.brand);

            const baseDataObj: object = {
                txVariant: this.state.type,
                brand: newBrandObj.brand
            };

            // Perform postMessage to send brand on specified (CVC) field
            if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_SECURITY_CODE)) {
                const dataObj: object = {
                    ...baseDataObj,
                    ...{
                        fieldType: ENCRYPTED_SECURITY_CODE,
                        hideCVC: pFeedbackObj.cvcPolicy === CVC_POLICY_HIDDEN,
                        cvcRequired: pFeedbackObj.cvcPolicy === CVC_POLICY_REQUIRED,
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

            this.callbacks.onBrand(callbackObj); // = SFPHandlers.handleOnBrand
        }

        return brandInfoObj;
    }

    return null;
}
