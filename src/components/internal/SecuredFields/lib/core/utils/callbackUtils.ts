import { ENCRYPTED_EXPIRY_DATE } from '../../configuration/constants';
import { CbObjOnFieldValid, EncryptionObj } from '../../types';
// import * as logger from '../../utilities/logger';

const makeCallbackObj = (
    pFieldType: string,
    pEncryptedFieldName: string,
    uuid: string,
    pIsValid: boolean,
    pTxVariant: string,
    pRootNode: HTMLElement
): CbObjOnFieldValid => ({
    fieldType: pFieldType, // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryDate
    encryptedFieldName: pEncryptedFieldName, // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear
    uid: uuid, // card-encrypted-encryptedCardNumber, card-encrypted-encryptedSecurityCode, card-encrypted-month, card-encrypted-year, card-encrypted-encryptedExpiryMonth, card-encrypted-encryptedExpiryYear
    valid: pIsValid,
    type: pTxVariant,
    rootNode: pRootNode // A ref to the 'form' element holding the securedFields
});

export const makeCallbackObjectsValidation = (pFieldType: string, pTxVariant: string, pRootNode: HTMLElement): CbObjOnFieldValid[] => {
    // - create callback objects to report the changed valid state of the field
    const isExpiryDateField: boolean = pFieldType === ENCRYPTED_EXPIRY_DATE;

    const callbackObjectsArr: CbObjOnFieldValid[] = [];

    const sepExpiryDateNames: string[] = ['encryptedExpiryMonth', 'encryptedExpiryYear'];

    let i: number;
    let uuid: string;
    let encryptedType: string;
    let encryptedFieldName: string;

    // For expiryDate field we need to remove 2 DOM elements & create 2 objects (relating to month & year)
    // - for everything else we just need to remove 1 element & create 1 callback object
    const totalFields: number = isExpiryDateField ? 2 : 1;

    for (i = 0; i < totalFields; i += 1) {
        encryptedType = isExpiryDateField ? sepExpiryDateNames[i] : pFieldType; // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear

        uuid = `${pTxVariant}-encrypted-${encryptedType}`; // card-encrypted-encryptedCardNumber, card-encrypted-encryptedSecurityCode, card-encrypted-encryptedExpiryMonth, card-encrypted-encryptedExpiryYear

        encryptedFieldName = isExpiryDateField ? encryptedType : pFieldType; // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear

        // Create objects to broadcast valid state
        const callbackObj: CbObjOnFieldValid = makeCallbackObj(pFieldType, encryptedFieldName, uuid, false, pTxVariant, pRootNode);

        callbackObjectsArr.push(callbackObj);
    }

    return callbackObjectsArr;
};

export const makeCallbackObjectsEncryption = (
    pFieldType: string,
    pTxVariant: string,
    pRootNode: HTMLElement,
    pEncryptedObjArr: EncryptionObj[]
): CbObjOnFieldValid[] => {
    let i: number;
    let uuid: string;
    let encryptedObj: EncryptionObj;
    let encryptedFieldName: string;
    let encryptedBlob: string;

    const callbackObjectsArr: CbObjOnFieldValid[] = [];

    for (i = 0; i < pEncryptedObjArr.length; i += 1) {
        encryptedObj = pEncryptedObjArr[i];
        encryptedFieldName = encryptedObj.encryptedFieldName;
        uuid = `${pTxVariant}-encrypted-${encryptedFieldName}`;
        encryptedBlob = encryptedObj.blob;

        // Create objects to broadcast valid state
        const callbackObj: CbObjOnFieldValid = makeCallbackObj(pFieldType, encryptedFieldName, uuid, true, pTxVariant, pRootNode);
        callbackObj.blob = encryptedBlob;

        callbackObjectsArr.push(callbackObj);
    }

    return callbackObjectsArr;
};
