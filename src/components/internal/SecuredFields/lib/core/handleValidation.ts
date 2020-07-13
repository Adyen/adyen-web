import { makeCallbackObjectsValidation } from './utils/callbackUtils';
import { removeEncryptedElement } from '../ui/encryptedElements';
import { processErrors } from './utils/processErrors';
import { existy } from '../utilities/commonUtils';
import { ENCRYPTED_SECURITY_CODE, ENCRYPTED_CARD_NUMBER } from '../configuration/constants';
import { SFFeedbackObj, CbObjOnFieldValid } from '../types';

import * as logger from '../utilities/logger';

const doLog = false;

export function handleValidation(pFeedbackObj: SFFeedbackObj): void {
    // --
    let callbackObjectsArr: CbObjOnFieldValid[];

    // EXTRACT VARS
    const fieldType: string = pFeedbackObj.fieldType;

    if (process.env.NODE_ENV === 'development' && doLog) {
        logger.log(
            '### HandleValidationCls2::handleValidation:: pFeedbackObj.fieldType=',
            pFeedbackObj.fieldType,
            'isEncrypted=',
            this.state.securedFields[fieldType].isEncrypted
        );
    }

    // CHECK IF CVC IS OPTIONAL
    if (existy(pFeedbackObj.cvcRequired)) {
        if (process.env.NODE_ENV === 'development' && doLog) {
            logger.log('\n### HandleValidationCls2:: SF onValidation:: pFeedbackObj.cvcRequired=', pFeedbackObj.cvcRequired);
        }
    }

    // Brand information (from setting the CC number) now contains information about
    // whether cvc is optional for that brand e.g. maestro
    // If it is optional, and we're dealing with the generic card type,
    // (re)set the property that indicates this (in the CVC SecuredField instance)
    if (
        this.state.type === 'card' &&
        Object.prototype.hasOwnProperty.call(pFeedbackObj, 'cvcRequired') &&
        existy(pFeedbackObj.cvcRequired) &&
        Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_SECURITY_CODE)
    ) {
        this.state.securedFields[ENCRYPTED_SECURITY_CODE].cvcRequired = pFeedbackObj.cvcRequired;
    }

    // PROCESS & BROADCAST ERRORS (OR LACK OF)
    processErrors(pFeedbackObj, this.state.securedFields[fieldType], this.state.type, this.props.rootNode, this.callbacks.onError);

    // REMOVE ANY EXISTING ENCRYPTED ELEMENT & CHECK VALIDITY OF THE FORM AS A WHOLE

    // If the field was previously encrypted...
    if (this.state.securedFields[fieldType].isEncrypted) {
        // callbackObjectsArr will be an array containing 1 or 2 objects that need to be broadcast
        callbackObjectsArr = makeCallbackObjectsValidation(fieldType, this.state.type, this.props.rootNode);

        // Add the endDigits to the object we send to the onFieldValid callback
        // NOTE: in this case (validation) this will be an empty string
        if (fieldType === ENCRYPTED_CARD_NUMBER) {
            callbackObjectsArr[0].endDigits = '';
        }

        for (let i = 0, len = callbackObjectsArr.length; i < len; i += 1) {
            // Remove DOM elements
            if (this.config.allowedDOMAccess) {
                removeEncryptedElement(this.props.rootNode, callbackObjectsArr[i].uid);
            }

            // ...BROADCAST VALID STATE OF INDIVIDUAL INPUTS
            this.callbacks.onFieldValid(callbackObjectsArr[i]);
        }

        // Remove the field's encrypted state
        this.state.securedFields[fieldType].isEncrypted = false;
    }

    // STORE & BROADCAST VALID STATE OF THE FORM AS A WHOLE ///////
    this.assessFormValidity();

    // PROCESS & BROADCAST CARD BRANDS
    // Doing it here: after calling onAllValid
    // Use case: When the card component is in a valid state and the card number is deleted it wrongly calls
    // the component's top level onValid callback.
    // Reason: When the card component receives the onBrand info before the onAllValid info it triggers an
    // onChange event - this wrongly perceives the component to be in a valid state because it is only the
    // onAllValid info that resets the state.isCardValid on which the state.isValid property depends.
    this.processBrand(pFeedbackObj);
}
