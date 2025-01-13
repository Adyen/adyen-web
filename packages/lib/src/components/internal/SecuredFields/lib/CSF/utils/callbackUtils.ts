import { ENCRYPTED_EXPIRY_DATE } from '../../constants';
import { CardFieldValidData, EncryptionObj } from '../../types';

interface CallbackObjectProps {
    fieldType: string;
    encryptedFieldName: string;
    uuid: string;
    isValid: boolean;
    txVariant: string;
    rootNode: HTMLElement;
}

const makeCallbackObj = ({ fieldType, encryptedFieldName, uuid, isValid, txVariant, rootNode }: CallbackObjectProps): CardFieldValidData => ({
    fieldType, // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryDate
    encryptedFieldName, // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear
    uid: uuid, // card-encrypted-encryptedCardNumber, card-encrypted-encryptedSecurityCode, card-encrypted-month, card-encrypted-year, card-encrypted-encryptedExpiryMonth, card-encrypted-encryptedExpiryYear
    valid: isValid,
    type: txVariant,
    rootNode // A ref to the 'form' element holding the securedFields
});

export const makeCallbackObjectsValidation = ({ fieldType, txVariant, rootNode }): CardFieldValidData[] => {
    // - create callback objects to report the changed valid state of the field
    const isExpiryDateField: boolean = fieldType === ENCRYPTED_EXPIRY_DATE;

    const callbackObjectsArr: CardFieldValidData[] = [];

    const sepExpiryDateNames: string[] = ['encryptedExpiryMonth', 'encryptedExpiryYear'];

    let i: number;
    let uuid: string;
    let encryptedType: string;
    let encryptedFieldName: string;

    // For expiryDate field we need to remove 2 DOM elements & create 2 objects (relating to month & year)
    // - for everything else we just need to remove 1 element & create 1 callback object
    const totalFields: number = isExpiryDateField ? 2 : 1;

    for (i = 0; i < totalFields; i += 1) {
        encryptedType = isExpiryDateField ? sepExpiryDateNames[i] : fieldType; // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear

        uuid = `${txVariant}-encrypted-${encryptedType}`; // card-encrypted-encryptedCardNumber, card-encrypted-encryptedSecurityCode, card-encrypted-encryptedExpiryMonth, card-encrypted-encryptedExpiryYear

        encryptedFieldName = isExpiryDateField ? encryptedType : fieldType; // encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear

        // Create objects to broadcast valid state
        // const callbackObj: CardFieldValidData = makeCallbackObj(pFieldType, encryptedFieldName, uuid, false, pTxVariant, pRootNode, null);
        const callbackObj: CardFieldValidData = makeCallbackObj({
            fieldType,
            encryptedFieldName,
            uuid,
            isValid: false,
            txVariant,
            rootNode
        } as CallbackObjectProps);

        callbackObjectsArr.push(callbackObj);
    }

    return callbackObjectsArr;
};

export const makeCallbackObjectsEncryption = ({ fieldType, txVariant, rootNode, encryptedObjArr }): CardFieldValidData[] => {
    let i: number;
    let uuid: string;
    let encryptedObj: EncryptionObj;
    let encryptedFieldName: string;
    let encryptedBlob: string;

    const callbackObjectsArr: CardFieldValidData[] = [];

    for (i = 0; i < encryptedObjArr.length; i += 1) {
        encryptedObj = encryptedObjArr[i];
        encryptedFieldName = encryptedObj.encryptedFieldName;
        uuid = `${txVariant}-encrypted-${encryptedFieldName}`;
        encryptedBlob = encryptedObj.blob;

        // Create objects to broadcast valid state
        // const callbackObj: CardFieldValidData = makeCallbackObj(fieldType, encryptedFieldName, uuid, true, txVariant, rootNode, code);
        const callbackObj: CardFieldValidData = makeCallbackObj({
            fieldType,
            encryptedFieldName,
            uuid,
            isValid: true,
            txVariant,
            rootNode
        } as CallbackObjectProps);
        callbackObj.blob = encryptedBlob;

        callbackObjectsArr.push(callbackObj);
    }

    return callbackObjectsArr;
};
