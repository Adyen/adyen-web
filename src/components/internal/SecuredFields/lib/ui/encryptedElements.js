import { selectOne } from '../utilities/dom';
import * as logger from '../utilities/logger';

const doLog = false;

// Adds hidden input to parent form element.
// This input has a attribute 'name' whose value equals a field-type e.g. encryptedCardNumber
// and an attribute 'value' whose value is the encrypted data blob for that field
const addEncryptedElement = (pForm, pName, pData, pId) => {
    let element = selectOne(pForm, `#${pId}`);

    if (!element) {
        element = document.createElement('input');
        element.type = 'hidden';
        element.name = pName;
        element.id = pId;

        // TODO - just for testing
        if (process.env.NODE_ENV === 'development' && doLog) {
            logger.log('\n§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§');
            logger.log('### encryptedElements::addEncryptedElement:: ', pName);
            logger.log('§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§');
        }
        pForm.appendChild(element);
    }

    element.setAttribute('value', pData);
};

export const removeEncryptedElement = (pParentForm, uuid) => {
    const encryptedElem = selectOne(pParentForm, `#${uuid}`);

    // TODO - just for testing
    if (process.env.NODE_ENV === 'development' && doLog) {
        logger.log('\n§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§');
        logger.log('### encryptedElements::removeEncryptedElement:: ', encryptedElem.getAttribute('name'));
        logger.log('§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§');
    }

    if (encryptedElem) {
        pParentForm.removeChild(encryptedElem);
    }
};

export const addEncryptedElements = (pEncryptedObjArr, pTxVariant, pParentForm) => {
    let i;
    let uuid;
    let encryptedFieldName;
    let encryptedBlob;

    // Loop through array of objects with encrypted blobs - normally only contains one object
    // but in case of combined encryptedExpiryDate field will contain 2 objects: one each for month & year
    for (i = 0; i < pEncryptedObjArr.length; i += 1) {
        const encryptedObj = pEncryptedObjArr[i];

        encryptedFieldName = encryptedObj.encryptedFieldName;

        uuid = `${pTxVariant}-encrypted-${encryptedFieldName}`;

        encryptedBlob = encryptedObj.blob;

        addEncryptedElement(pParentForm, encryptedFieldName, encryptedBlob, uuid);
    }
};
