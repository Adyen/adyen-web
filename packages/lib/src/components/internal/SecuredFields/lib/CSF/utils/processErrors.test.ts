/* global expect, describe, jest, beforeEach */
import { processErrors } from './processErrors';
import SecuredField from '../../securedField/SecuredField';
const ERROR_MSG_CARD_TOO_FAR_IN_FUTURE = 'ERROR_MSG_CARD_TOO_FAR_IN_FUTURE';
const ERROR_MSG_CARD_TOO_OLD = 'ERROR_MSG_CARD_TOO_OLD';
const ERROR_MSG_INCOMPLETE_FIELD = 'ERROR_MSG_INCOMPLETE_FIELD';
const mockState = {
    securedFields: {
        encryptedCardNumber: { hasError: false, errorType: '' },
        encryptedExpiryDate: { hasError: false, errorType: '' },
        encryptedSecurityCode: { hasError: false, errorType: '' }
    },
    type: 'card'
};

let callbackFnCalled = false;

const rootNode = null;

const onError = () => {
    callbackFnCalled = true;
};

const errorObj_dateTooOld = {
    error: ERROR_MSG_CARD_TOO_OLD,
    action: 'dateKeyPressed',
    fieldType: 'encryptedExpiryDate',
    numKey: 3522473789
};

const erroObj_dateTooFar = {
    error: ERROR_MSG_CARD_TOO_FAR_IN_FUTURE,
    action: 'dateKeyPressed',
    fieldType: 'encryptedExpiryDate',
    numKey: 3522473789
};

const errorObj_incompleteField = {
    error: ERROR_MSG_INCOMPLETE_FIELD,
    action: 'blur',
    fieldType: 'encryptedCardNumber',
    numKey: 3522473789
};

// const errorObj_luhnCheck = {
//    "action": "luhnCheck",
//    "error": "luhn check failed",
//    "fieldType": "encryptedCardNumber",
//    "numKey": 2222688079
// };
//
// const errorObj_numberMismatch = {
//    "error": ERROR_MSG_CARD_NUMBER_MISMATCH,
//    "action": "numberKeyPressed",
//    "fieldType": "encryptedCardNumber",
//    "numKey": 3162491918
// };

const noErrorObj = {
    error: '',
    action: 'dateKeyPressed',
    fieldType: 'encryptedCardNumber',
    numKey: 3522473789
};

const noErrorObj_date = {
    error: '',
    action: 'dateKeyPressed',
    fieldType: 'encryptedExpiryDate',
    numKey: 3522473789
};

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    //    console.log = jest.fn(() => {});

    callbackFnCalled = false;
});

describe('A suite of tests for processError (errors sent from securedFields) - fny to create error object for callback fn, store error refs, and throttle to only call callback fn when error has changed', () => {
    // --
    // test('Should do nothing since the passed object does not have an error property', () => {
    //     const dataObj = processErrors({ propA: 'a', propB: 'b' });
    //     expect(dataObj).toBe(null);
    //     expect(callbackFnCalled).toBe(false);
    // });

    // NOTE: SEQUENCE IS IMPORTANT

    // #1
    //    test('Should do nothing since the error represents a "reset" on a non-error state - so error state has not changed', () => {
    //
    //        const dataObj = processErrors(noErrorObj, mockState, mockConfig, mockCallbacks);
    //        expect(dataObj).toBe(null);
    //        expect(callbackFnCalled).toBe(false);
    //    });

    // #2
    test('Should process an error normally, setting the relevant properties and calling the callback fn', () => {
        const field = mockState.securedFields.encryptedCardNumber as SecuredField;

        const dataObj = processErrors(errorObj_incompleteField, field, 'card', rootNode, onError);

        expect(dataObj).toHaveProperty('error', ERROR_MSG_INCOMPLETE_FIELD);
        expect(dataObj).toHaveProperty('type', mockState.type);

        expect(field).toHaveProperty('hasError', true);
        expect(field).toHaveProperty('errorType', ERROR_MSG_INCOMPLETE_FIELD);

        expect(callbackFnCalled).toBe(true);
    });

    // #3
    test('Should process the above error error being cleared; setting the relevant properties and calling the callback fn', () => {
        const field = mockState.securedFields.encryptedCardNumber as SecuredField;

        // Clear error
        const dataObj = processErrors(noErrorObj, field, 'card', rootNode, onError);

        expect(dataObj).toHaveProperty('error', '');
        expect(dataObj).toHaveProperty('type', mockState.type);

        expect(field).toHaveProperty('hasError', false);
        expect(field).toHaveProperty('errorType', '');

        expect(callbackFnCalled).toBe(true);
    });

    // #4
    test(
        'Should do nothing since error is empty string && field is not already in error ' +
            '(This situation arises when we encrypt a field and trigger an "error clearing" event)',
        () => {
            const field = mockState.securedFields.encryptedCardNumber as SecuredField;

            const dataObj = processErrors(noErrorObj, field, 'card', rootNode, onError);

            expect(dataObj).toBe(null);
            expect(callbackFnCalled).toBe(false);
        }
    );

    // #5
    test('Should set an error normally, on a date field', () => {
        const field = mockState.securedFields.encryptedExpiryDate as SecuredField;

        const dataObj = processErrors(errorObj_dateTooOld, field, 'card', rootNode, onError);

        expect(dataObj).toHaveProperty('error', ERROR_MSG_CARD_TOO_OLD);
        expect(dataObj).toHaveProperty('type', mockState.type);

        expect(field).toHaveProperty('hasError', true);
        expect(field).toHaveProperty('errorType', ERROR_MSG_CARD_TOO_OLD);

        expect(callbackFnCalled).toBe(true);
    });

    // #6
    //    test('Should do nothing since the error represents a repeat of the last error - so error state has not changed', () => {
    //
    //        const dataObj = processErrors(errorObj_dateTooOld, mockState, mockConfig, mockCallbacks);
    //        expect(dataObj).toBe(null);
    //        expect(callbackFnCalled).toBe(false);
    //    });

    // #7
    test('Should set a new error, proceeding normally: the error is building on an existing error - so error state has changed', () => {
        const field = mockState.securedFields.encryptedExpiryDate as SecuredField;

        const dataObj = processErrors(erroObj_dateTooFar, field, 'card', rootNode, onError);

        expect(dataObj).toHaveProperty('error', ERROR_MSG_CARD_TOO_FAR_IN_FUTURE);
        expect(dataObj).toHaveProperty('type', mockState.type);

        expect(field).toHaveProperty('hasError', true);
        expect(field).toHaveProperty('errorType', ERROR_MSG_CARD_TOO_FAR_IN_FUTURE);

        expect(callbackFnCalled).toBe(true);
    });

    // #8
    test('Should process the above error error being cleared; setting the relevant properties and calling the callback fn', () => {
        const field = mockState.securedFields.encryptedExpiryDate as SecuredField;

        // Clear error
        const dataObj = processErrors(noErrorObj_date, field, 'card', rootNode, onError);

        expect(dataObj).toHaveProperty('error', '');
        expect(dataObj).toHaveProperty('type', mockState.type);

        expect(field).toHaveProperty('hasError', false);
        expect(field).toHaveProperty('errorType', '');

        expect(callbackFnCalled).toBe(true);
    });

    // #9
    test('Should process a "reset" on an error that has been set directly on the field e.g. from a call to \'showValidation\' from the Components: setting the relevant properties and calling the callback fn', () => {
        const field = mockState.securedFields.encryptedExpiryDate as SecuredField;

        field.hasError = true; // Error has been set directly

        // Clear error
        const dataObj = processErrors(noErrorObj_date, field, 'card', rootNode, onError);

        expect(dataObj).toHaveProperty('error', '');
        expect(dataObj).toHaveProperty('type', mockState.type);

        expect(field).toHaveProperty('hasError', false);
        expect(field).toHaveProperty('errorType', '');

        expect(callbackFnCalled).toBe(true);
    });
});
