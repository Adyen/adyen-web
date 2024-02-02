import { makeCallbackObjectsEncryption } from '../utils/callbackUtils';
import { ENCRYPTED_EXPIRY_MONTH, ENCRYPTED_EXPIRY_YEAR, ENCRYPTED_SECURITY_CODE, ENCRYPTED_CARD_NUMBER } from '../../configuration/constants';
import { processErrors } from '../utils/processErrors';
import { truthy } from '../../utilities/commonUtils';
import { SFFeedbackObj, CbObjOnFieldValid, EncryptionObj } from '../../types';
import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';
import getIframeContentWin from '../utils/iframes/getIframeContentWin';

export function handleEncryption(pFeedbackObj: SFFeedbackObj): void {
    // EXTRACT VARS
    const fieldType: string = pFeedbackObj.fieldType;

    // SET FOCUS ON OTHER INPUT - If user has just typed a correct expiryDate - set focus on the cvc field OR typed a correct expiryMonth - focus on year field
    if (this.config.autoFocus) {
        // pFeedbackObj.type === 'year' when the encryption is happening on an expiryDate field c.f. a separate year field (when it equals ENCRYPTED_EXPIRY_YEAR)
        if (pFeedbackObj.type === 'year' || fieldType === ENCRYPTED_EXPIRY_YEAR) {
            this.setFocusOnFrame(ENCRYPTED_SECURITY_CODE);
        }
        if (fieldType === ENCRYPTED_EXPIRY_MONTH) {
            this.setFocusOnFrame(ENCRYPTED_EXPIRY_YEAR);
        }
    }
    //--

    let i: number;
    let len: number;

    const encryptedObjArr: EncryptionObj[] = pFeedbackObj[fieldType];

    // Set boolean saying this securedField is in an encryptedState
    this.state.securedFields[fieldType].isEncrypted = true;

    // REMOVE ANY ERRORS ON FIELD e.g. was a full number that failed the luhnCheck, then we corrected the number and now it passes
    processErrors(
        { error: '', fieldType } as any as SFFeedbackObj,
        this.state.securedFields[fieldType],
        this.state.type,
        this.props.rootNode,
        this.callbacks.onError
    );

    // MAKE ENCRYPTION OBJECTS FOR EACH OF THE INDIVIDUAL INPUTS
    // N.B. when considering "individual inputs" we are concerned with the 4 fields that the checkoutAPI expects to receive for a credit card payment:
    // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear
    const callbackObjectsArr: CbObjOnFieldValid[] = makeCallbackObjectsEncryption({
        fieldType,
        txVariant: this.state.type,
        rootNode: this.props.rootNode,
        encryptedObjArr
    });

    // For standalone month field
    if (fieldType === ENCRYPTED_EXPIRY_MONTH) {
        if (hasOwnProperty(this.state.securedFields, ENCRYPTED_EXPIRY_YEAR)) {
            const dataObj: object = {
                txVariant: this.state.type,
                code: pFeedbackObj.code,
                blob: encryptedObjArr[0].blob,
                fieldType: ENCRYPTED_EXPIRY_YEAR,
                numKey: this.state.securedFields[ENCRYPTED_EXPIRY_YEAR].numKey
            };
            postMessageToIframe(dataObj, getIframeContentWin(this.state, ENCRYPTED_EXPIRY_YEAR), this.config.loadingContext);
        }
    }

    // For number field - add the endDigits to the encryption object
    if (fieldType === ENCRYPTED_CARD_NUMBER && truthy(pFeedbackObj.endDigits)) {
        callbackObjectsArr[0].endDigits = pFeedbackObj.endDigits;
    }

    // For number field - add the 8 digit issuerBin to the encryption object
    if (fieldType === ENCRYPTED_CARD_NUMBER && truthy(pFeedbackObj.issuerBin)) {
        callbackObjectsArr[0].issuerBin = +pFeedbackObj.issuerBin;
    }

    // BROADCAST VALID STATE OF INDIVIDUAL INPUTS - passing the encryption objects
    for (i = 0, len = callbackObjectsArr.length; i < len; i += 1) {
        this.callbacks.onFieldValid(callbackObjectsArr[i]);
    }
    //--------------------------------------------

    // STORE & BROADCAST VALID STATE OF THE FORM AS A WHOLE ///////
    this.validateForm();
}
