import { addEncryptedElements } from '../utils/encryptedElements';
import { handleEncryption } from './handleEncryption';
// import { SFFeedbackObj } from '../../types';

jest.mock('../utils/encryptedElements');

const mockedAddEncryptedElementMock = addEncryptedElements as jest.Mock;

// let callbackObj_error = null;
// let callbackObj_fieldValid = null;

let fieldToFocus = null;

const securedFieldsObj = {
    encryptedCardNumber: { hasError: false, isEncrypted: false },
    encryptedExpiryDate: { hasError: false, isEncrypted: false },
    encryptedSecurityCode: { hasError: false, cvcPolicy: 'required', isEncrypted: false }
};

const myCSF = {
    state: { type: 'card', securedFields: securedFieldsObj },
    props: { rootNode: 'div' },
    config: { allowedDOMAccess: true, autoFocus: false },
    callbacks: {
        onFieldValid: jest.fn(obj => {
            console.log('### handleEncryption.test::callbacks.onFieldValid:: obj', obj);
            // callbackObj_fieldValid = obj;
        }),
        onError: null
    },
    handleEncryption,
    validateForm: jest.fn(() => {
        console.log('### handleEncryption.test::myCSF.validateForm:: ');
    }),
    setFocusOnFrame: null
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

// const feedbackObj_error: SFFeedbackObj = {
//     error: 'error.va.sf-cc-cvc.02',
//     action: 'incorrectly filled field',
//     fieldType: 'encryptedSecurityCode',
//     numKey: 3480222232
// };
//
// const feedbackObj_clearedError: SFFeedbackObj = {
//     error: '',
//     action: 'delete',
//     fieldType: 'encryptedSecurityCode',
//     numKey: 3480222232
// };

// ////////

// const expected_callbackObj_errorSet = {
//     rootNode: 'div',
//     fieldType: 'encryptedSecurityCode',
//     error: 'error.va.sf-cc-cvc.02',
//     type: 'card'
// };
//
// const expected_callbackObj_errorCleared = {
//     rootNode: 'div',
//     fieldType: 'encryptedSecurityCode',
//     error: '',
//     type: 'card'
// };

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

const expected_callbackObj_onFieldValid_Year = {
    fieldType: 'encryptedExpiryDate',
    encryptedFieldName: 'encryptedExpiryYear',
    uid: 'card-encrypted-encryptedExpiryYear',
    valid: true,
    type: 'card',
    rootNode: 'div',
    blob: 'eyJhbGc_'
};

// const expected_callbackObj_onFieldValid_PAN = {
//     fieldType: 'encryptedCardNumber',
//     encryptedFieldName: 'encryptedCardNumber',
//     uid: 'card-encrypted-encryptedCardNumber',
//     valid: false,
//     type: 'card',
//     rootNode: 'div',
//     endDigits: ''
// };

describe('Testing CSFs handleEncryption functionality', () => {
    const addEncryptedElementMock = jest.fn((obj, id) => console.log('### handleEncryption.test::Mock FN call:: ', obj, id));

    beforeEach(() => {
        // console.log = jest.fn(() => {});

        mockedAddEncryptedElementMock.mockReset();
        mockedAddEncryptedElementMock.mockImplementation((obj, id) => addEncryptedElementMock(obj, id));
        addEncryptedElementMock.mockClear();

        myCSF.callbacks.onError = jest.fn(obj => {
            console.log('### handleEncryption.test::callbacks.onError:: obj', obj);
            // callbackObj_error = obj;
        });

        myCSF.setFocusOnFrame = jest.fn(fieldType => {
            fieldToFocus = fieldType;
        });
    });

    test(
        'handleEncryption should handle an object detailing an encrypted cvc field to set the isEncrypted prop on the appropriate securedField in state, ' +
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
        'handleEncryption should handle an object detailing an encrypted date field to set the isEncrypted prop on the appropriate securedField in state, ' +
            'call the onFieldValid callback twice, with the expected objects, call validateForm, and call setFocusOnFrame',
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

    // test('handleValidation, when passed an error-clearing feedback object, should call processErrors, leading to a call to the onError callback; and then proceed to call validateForm', () => {
    //     myCSF.config.allowedDOMAccess = false;
    //
    //     myCSF.handleValidation(feedbackObj_clearedError);
    //
    //     expect(myCSF.callbacks.onError).toHaveBeenCalledTimes(1);
    //     expect(callbackObj_error).toEqual(expected_callbackObj_errorCleared);
    //
    //     expect(myCSF.validateForm).toHaveBeenCalledTimes(2);
    // });
    //
    // test(
    //     'handleValidation, when passed a brand feedback object, should call processErrors which will immediately return and so not call to the onError callback; ' +
    //         'then proceed to call validateForm and processBrands; and because the brand is maestro it should also set cvcPolicy on the encryptedSecurityCode object',
    //     () => {
    //         myCSF.handleValidation(feedbackObj_brand_maestro);
    //
    //         expect(myCSF.callbacks.onError).not.toHaveBeenCalled();
    //
    //         expect(myCSF.validateForm).toHaveBeenCalledTimes(3);
    //
    //         expect(myCSF.state.securedFields.encryptedSecurityCode.cvcPolicy).toEqual('optional');
    //
    //         expect(myCSF.processBrand).toHaveBeenCalled();
    //     }
    // );
    //
    // test(
    //     'handleValidation, when dealing with a securityCode that was previously encrypted, ' +
    //         'should call processErrors which will return and so not call to the onError callback; ' +
    //         'then proceed to call validateForm, callbacks.onFieldValid & set isEncrypted on the encryptedSecurityCode object',
    //     () => {
    //         myCSF.state.securedFields.encryptedSecurityCode.isEncrypted = true;
    //         myCSF.config.allowedDOMAccess = true;
    //
    //         myCSF.handleValidation(feedbackObj_clearedError);
    //
    //         expect(myCSF.callbacks.onError).not.toHaveBeenCalled();
    //
    //         expect(myCSF.validateForm).toHaveBeenCalledTimes(4); //4
    //
    //         // check for a call to removeEncryptedElement
    //         expect(removeEncryptedElementMock).toHaveBeenCalled();
    //
    //         expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
    //         expect(callbackObj_fieldValid).toEqual(expected_callbackObj_onFieldValid);
    //
    //         expect(myCSF.state.securedFields.encryptedSecurityCode.isEncrypted).toEqual(false);
    //     }
    // );
    //
    // test(
    //     'handleValidation, when dealing with a cardNumber that was previously encrypted, ' +
    //         'should call processErrors which will return and so not call to the onError callback; ' +
    //         'then proceed to call validateForm, callbacks.onFieldValid (sending an endDigits property) & set isEncrypted on the encryptedCardNumber object',
    //     () => {
    //         myCSF.state.securedFields.encryptedCardNumber.isEncrypted = true;
    //         myCSF.config.allowedDOMAccess = false;
    //
    //         myCSF.handleValidation(feedbackObj_clearedError_PAN);
    //
    //         expect(myCSF.callbacks.onError).not.toHaveBeenCalled();
    //
    //         expect(myCSF.validateForm).toHaveBeenCalledTimes(5);
    //
    //         expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
    //         expect(callbackObj_fieldValid).toEqual(expected_callbackObj_onFieldValid_PAN);
    //
    //         expect(myCSF.state.securedFields.encryptedCardNumber.isEncrypted).toEqual(false);
    //     }
    // );
});
