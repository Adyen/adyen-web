import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { addEncryptedElements } from '../utils/encryptedElements';
import { handleEncryption } from './handleEncryption';

jest.mock('../utils/encryptedElements');
jest.mock('../utils/iframes/postMessageToIframe');

const mockedAddEncryptedElementMock = addEncryptedElements as jest.Mock;
const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

let fieldToFocus = null;

const securedFieldsObj = {
    encryptedCardNumber: { hasError: true, isEncrypted: false },
    encryptedExpiryDate: { hasError: false, isEncrypted: false },
    encryptedExpiryMonth: { hasError: false, isEncrypted: false },
    encryptedExpiryYear: { numKey: 654321 },
    encryptedSecurityCode: { hasError: false, cvcPolicy: 'required', isEncrypted: false }
};

const myCSF = {
    state: { type: 'card', securedFields: securedFieldsObj },
    props: { rootNode: 'div' },
    config: { allowedDOMAccess: true, autoFocus: false },
    callbacks: {
        onFieldValid: jest.fn(obj => {
            console.log('### handleEncryption.test::callbacks.onFieldValid:: obj', obj);
        }),
        onError: null
    },
    handleEncryption,
    validateForm: jest.fn(() => {
        console.log('### handleEncryption.test::myCSF.validateForm:: ');
    }),
    setFocusOnFrame: null
};

const feedbackObj_encryptedCard: any = {
    type: 'encryptedCardNumber',
    action: 'encryption',
    encryptedCardNumber: [
        {
            type: 'encryptedCardNumber',
            encryptedFieldName: 'encryptedCardNumber',
            blob: 'eyJhbGc'
        }
    ],
    endDigits: '1111',
    issuerBin: '41111111',
    fieldType: 'encryptedCardNumber',
    numKey: 2577403429
};

const feedbackObj_encryptedCVC: any = {
    type: 'encryptedSecurityCode',
    action: 'encryption',
    encryptedSecurityCode: [
        {
            type: 'encryptedSecurityCode',
            encryptedFieldName: 'encryptedSecurityCode',
            blob: 'eyJhbGc'
        }
    ],
    fieldType: 'encryptedSecurityCode',
    numKey: 3824721353
};

const feedbackObj_encryptedDate: any = {
    type: 'year',
    action: 'encryption',
    encryptedExpiryDate: [
        {
            type: 'month',
            encryptedFieldName: 'encryptedExpiryMonth',
            blob: 'eyJhbGc'
        },
        {
            type: 'year',
            encryptedFieldName: 'encryptedExpiryYear',
            blob: 'eyJhbGc_'
        }
    ],
    fieldType: 'encryptedExpiryDate',
    numKey: 2083655694
};

const feedbackObj_encryptedMonth: any = {
    type: 'encryptedExpiryMonth',
    action: 'encryption',
    encryptedExpiryMonth: [
        {
            type: 'encryptedExpiryMonth',
            encryptedFieldName: 'encryptedExpiryMonth',
            blob: 'eyJhbGc'
        }
    ],
    code: '440_472',
    fieldType: 'encryptedExpiryMonth',
    numKey: 1069876890
};

// ////////

const expected_callbackObj_errorCleared = {
    rootNode: 'div',
    fieldType: 'encryptedCardNumber',
    error: '',
    type: 'card'
};

const expected_callbackObj_onFieldValid_CVC = {
    fieldType: 'encryptedSecurityCode',
    encryptedFieldName: 'encryptedSecurityCode',
    uid: 'card-encrypted-encryptedSecurityCode',
    valid: true,
    type: 'card',
    rootNode: 'div',
    blob: 'eyJhbGc'
};

const expected_callbackObj_onFieldValid_Month = {
    fieldType: 'encryptedExpiryDate',
    encryptedFieldName: 'encryptedExpiryMonth',
    uid: 'card-encrypted-encryptedExpiryMonth',
    valid: true,
    type: 'card',
    rootNode: 'div',
    blob: 'eyJhbGc'
};

const expected_callbackObj_onFieldValid_SeparateMonth = {
    blob: 'eyJhbGc',
    encryptedFieldName: 'encryptedExpiryMonth',
    fieldType: 'encryptedExpiryMonth',
    rootNode: 'div',
    type: 'card',
    uid: 'card-encrypted-encryptedExpiryMonth',
    valid: true
};

const expected_callbackObj_onFieldValid_Year = {
    fieldType: 'encryptedExpiryDate',
    encryptedFieldName: 'encryptedExpiryYear',
    uid: 'card-encrypted-encryptedExpiryYear',
    valid: true,
    type: 'card',
    rootNode: 'div',
    blob: 'eyJhbGc_'
};

const expected_callbackObj_onFieldValid_PAN = {
    fieldType: 'encryptedCardNumber',
    encryptedFieldName: 'encryptedCardNumber',
    uid: 'card-encrypted-encryptedCardNumber',
    valid: true,
    type: 'card',
    rootNode: 'div',
    blob: 'eyJhbGc',
    endDigits: '1111',
    issuerBin: 41111111
};

describe('Testing CSFs handleEncryption functionality', () => {
    const addEncryptedElementMock = jest.fn((obj, id) => console.log('### handleEncryption.test::Mock FN call to addEncryptedElement:: ', obj, id));
    const postMessageToIframeMock = jest.fn(obj => console.log('### handleEncryption.test::Mock FN call to postMessageToIframe:: ', obj));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        mockedAddEncryptedElementMock.mockReset();
        mockedAddEncryptedElementMock.mockImplementation((obj, id) => addEncryptedElementMock(obj, id));
        addEncryptedElementMock.mockClear();

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();

        myCSF.callbacks.onError = jest.fn(obj => {
            console.log('### handleEncryption.test::callbacks.onError:: obj', obj);
            // callbackObj_error = obj;
        });

        myCSF.setFocusOnFrame = jest.fn(fieldType => {
            fieldToFocus = fieldType;
        });
    });

    test(
        'handleEncryption should handle an object detailing an encrypted cvc field to set the isEncrypted prop on state.securedFields.encryptedSecurityCode, ' +
            'call the onFieldValid callback with the expected object; and call validateForm',
        () => {
            myCSF.handleEncryption(feedbackObj_encryptedCVC);

            expect(myCSF.state.securedFields.encryptedSecurityCode.isEncrypted).toEqual(true);

            // check for a call to addEncryptedElement
            expect(addEncryptedElementMock).toHaveBeenCalled();

            expect(myCSF.callbacks.onError).not.toHaveBeenCalled();

            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalledWith(expected_callbackObj_onFieldValid_CVC);

            expect(myCSF.validateForm).toHaveBeenCalledTimes(1);
        }
    );

    test(
        'handleEncryption should handle an object detailing an encrypted date field to set the isEncrypted prop on state.securedFields.encryptedExpiryDate, ' +
            'call the onFieldValid callback twice, with the expected objects, call validateForm, and call setFocusOnFrame to focus the cvc field',
        () => {
            myCSF.config.allowedDOMAccess = false;
            myCSF.config.autoFocus = true;

            myCSF.handleEncryption(feedbackObj_encryptedDate);

            expect(myCSF.state.securedFields.encryptedExpiryDate.isEncrypted).toEqual(true);

            // check call to addEncryptedElement not made
            expect(addEncryptedElementMock).not.toHaveBeenCalled();

            expect(myCSF.callbacks.onError).not.toHaveBeenCalled();

            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalledWith(expected_callbackObj_onFieldValid_Month);
            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalledWith(expected_callbackObj_onFieldValid_Year);

            expect(myCSF.validateForm).toHaveBeenCalledTimes(2);

            expect(myCSF.setFocusOnFrame).toHaveBeenCalled();
            expect(fieldToFocus).toEqual('encryptedSecurityCode');
        }
    );

    test(
        'handleEncryption should handle an object detailing an encrypted month field to set the isEncrypted prop on state.securedFields.encryptedExpiryMonth, ' +
            'call the onFieldValid callback with the expected object, call validateForm, and call setFocusOnFrame to focus the year field. It should also call postMessageToIframe',
        () => {
            myCSF.handleEncryption(feedbackObj_encryptedMonth);

            expect(myCSF.state.securedFields.encryptedExpiryMonth.isEncrypted).toEqual(true);

            expect(myCSF.callbacks.onError).not.toHaveBeenCalled();

            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalledWith(expected_callbackObj_onFieldValid_SeparateMonth);

            expect(myCSF.validateForm).toHaveBeenCalledTimes(3);

            expect(myCSF.setFocusOnFrame).toHaveBeenCalled();
            expect(fieldToFocus).toEqual('encryptedExpiryYear');

            expect(postMessageToIframeMock).toHaveBeenCalledWith({
                txVariant: 'card',
                code: '440_472',
                blob: 'eyJhbGc',
                fieldType: 'encryptedExpiryYear',
                numKey: 654321
            });
        }
    );

    test(
        'handleEncryption should handle an object detailing an encrypted PAN field (that had been in error), to set the isEncrypted prop on state.securedFields.encryptedCardNumber, ' +
            'call the processErrors & onFieldValid callbacks with the expected objects, call validateForm, and not call setFocusOnFrame',
        () => {
            myCSF.handleEncryption(feedbackObj_encryptedCard);

            expect(myCSF.state.securedFields.encryptedCardNumber.isEncrypted).toEqual(true);

            expect(myCSF.callbacks.onError).toHaveBeenCalledWith(expected_callbackObj_errorCleared);

            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalledWith(expected_callbackObj_onFieldValid_PAN);

            expect(myCSF.validateForm).toHaveBeenCalledTimes(4);

            expect(myCSF.setFocusOnFrame).not.toHaveBeenCalled();
        }
    );
});
