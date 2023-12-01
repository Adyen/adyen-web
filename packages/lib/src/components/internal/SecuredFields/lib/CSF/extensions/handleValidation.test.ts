import { removeEncryptedElement } from '../utils/encryptedElements';
import { handleValidation } from './handleValidation';
import { SFFeedbackObj } from '../../types';

jest.mock('../utils/encryptedElements');

const mockedRemoveEncryptedElementMock = removeEncryptedElement as jest.Mock;

let callbackObj_error = null;
let callbackObj_fieldValid = null;

const securedFieldsObj = {
    encryptedCardNumber: { hasError: false, isEncrypted: false },
    encryptedExpiryDate: { hasError: false },
    encryptedSecurityCode: { hasError: false, cvcPolicy: 'required', isEncrypted: false }
};

const myCSF = {
    state: { type: 'card', securedFields: securedFieldsObj },
    props: { rootNode: 'div' },
    config: { allowedDOMAccess: false },
    callbacks: {
        onFieldValid: jest.fn(obj => {
            console.log('### handleValidation.test::callbacks.onFieldValid:: obj', obj);
            callbackObj_fieldValid = obj;
        }),
        onError: null
    },
    handleValidation,
    validateForm: jest.fn(() => {
        console.log('### handleValidation.test::myCSF.validateForm:: ');
    }),
    processBrand: jest.fn(() => {})
};

const feedbackObj_error: SFFeedbackObj = {
    error: 'error.va.sf-cc-cvc.02',
    action: 'incorrectly filled field',
    fieldType: 'encryptedSecurityCode',
    numKey: 3480222232
};

const feedbackObj_clearedError: SFFeedbackObj = {
    error: '',
    action: 'delete',
    fieldType: 'encryptedSecurityCode',
    numKey: 3480222232
};

const feedbackObj_clearedError_PAN: SFFeedbackObj = {
    error: '',
    action: 'delete',
    fieldType: 'encryptedCardNumber',
    numKey: 3480222232
};

const feedbackObj_brand_maestro: SFFeedbackObj = {
    brand: 'maestro',
    cvcPolicy: 'optional',
    cvcText: 'Security_code',
    maxLength: 3,
    action: 'brand',
    fieldType: 'encryptedCardNumber',
    numKey: 1292815120
};

// ////////

const expected_callbackObj_errorSet = {
    rootNode: 'div',
    fieldType: 'encryptedSecurityCode',
    error: 'error.va.sf-cc-cvc.02',
    type: 'card'
};

const expected_callbackObj_errorCleared = {
    rootNode: 'div',
    fieldType: 'encryptedSecurityCode',
    error: '',
    type: 'card'
};

const expected_callbackObj_onFieldValid = {
    fieldType: 'encryptedSecurityCode',
    encryptedFieldName: 'encryptedSecurityCode',
    uid: 'card-encrypted-encryptedSecurityCode',
    valid: false,
    type: 'card',
    rootNode: 'div'
};

const expected_callbackObj_onFieldValid_PAN = {
    fieldType: 'encryptedCardNumber',
    encryptedFieldName: 'encryptedCardNumber',
    uid: 'card-encrypted-encryptedCardNumber',
    valid: false,
    type: 'card',
    rootNode: 'div',
    endDigits: ''
};

describe('Testing CSFs handleValidation functionality', () => {
    const removeEncryptedElementMock = jest.fn((obj, id) => console.log('### handleValidation.test::FN call:: ', obj, id));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        mockedRemoveEncryptedElementMock.mockReset();
        mockedRemoveEncryptedElementMock.mockImplementation((obj, id) => removeEncryptedElementMock(obj, id));
        removeEncryptedElementMock.mockClear();

        myCSF.callbacks.onError = jest.fn(obj => {
            console.log('### handleValidation.test::callbacks.onError:: obj', obj);
            callbackObj_error = obj;
        });
    });

    test('handleValidation, when passed an error feedback object, should call processErrors, leading to a call to the onError callback; and then proceed to call validateForm', () => {
        myCSF.handleValidation(feedbackObj_error);

        expect(myCSF.callbacks.onError).toHaveBeenCalledTimes(1);
        expect(callbackObj_error).toEqual(expected_callbackObj_errorSet);

        expect(myCSF.validateForm).toHaveBeenCalledTimes(1);
    });

    test('handleValidation, when passed an error-clearing feedback object, should call processErrors, leading to a call to the onError callback; and then proceed to call validateForm', () => {
        myCSF.handleValidation(feedbackObj_clearedError);

        expect(myCSF.callbacks.onError).toHaveBeenCalledTimes(1);
        expect(callbackObj_error).toEqual(expected_callbackObj_errorCleared);

        expect(myCSF.validateForm).toHaveBeenCalledTimes(2);
    });

    test(
        'handleValidation, when passed a brand feedback object, should call processErrors which will immediately return and so not call to the onError callback; ' +
            'then proceed to call validateForm and processBrands; and because the brand is maestro it should also set cvcPolicy on the encryptedSecurityCode object',
        () => {
            myCSF.handleValidation(feedbackObj_brand_maestro);

            expect(myCSF.callbacks.onError).not.toHaveBeenCalled();

            expect(myCSF.validateForm).toHaveBeenCalledTimes(3);

            expect(myCSF.state.securedFields.encryptedSecurityCode.cvcPolicy).toEqual('optional');

            expect(myCSF.processBrand).toHaveBeenCalled();
        }
    );

    test(
        'handleValidation, when dealing with a securityCode that was previously encrypted, ' +
            'should call processErrors which will return and so not call to the onError callback; ' +
            'then proceed to call validateForm, callbacks.onFieldValid & set isEncrypted on the encryptedSecurityCode object',
        () => {
            myCSF.state.securedFields.encryptedSecurityCode.isEncrypted = true;
            myCSF.config.allowedDOMAccess = true;

            myCSF.handleValidation(feedbackObj_clearedError);

            expect(myCSF.callbacks.onError).not.toHaveBeenCalled();

            expect(myCSF.validateForm).toHaveBeenCalledTimes(4); //4

            // check for a call to removeEncryptedElement
            expect(removeEncryptedElementMock).toHaveBeenCalled();

            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
            expect(callbackObj_fieldValid).toEqual(expected_callbackObj_onFieldValid);

            expect(myCSF.state.securedFields.encryptedSecurityCode.isEncrypted).toEqual(false);
        }
    );

    test(
        'handleValidation, when dealing with a cardNumber that was previously encrypted, ' +
            'should call processErrors which will return and so not call to the onError callback; ' +
            'then proceed to call validateForm, callbacks.onFieldValid (sending an endDigits property) & set isEncrypted on the encryptedCardNumber object',
        () => {
            myCSF.state.securedFields.encryptedCardNumber.isEncrypted = true;
            myCSF.config.allowedDOMAccess = false;

            myCSF.handleValidation(feedbackObj_clearedError_PAN);

            expect(myCSF.callbacks.onError).not.toHaveBeenCalled();

            expect(myCSF.validateForm).toHaveBeenCalledTimes(5);

            expect(myCSF.callbacks.onFieldValid).toHaveBeenCalled();
            expect(callbackObj_fieldValid).toEqual(expected_callbackObj_onFieldValid_PAN);

            expect(myCSF.state.securedFields.encryptedCardNumber.isEncrypted).toEqual(false);
        }
    );
});
