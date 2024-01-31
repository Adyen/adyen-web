import validateForm from './validateForm';

const securedFieldsObj = {
    encryptedCardNumber: { isValid: false },
    encryptedExpiryDate: { isValid: true },
    encryptedSecurityCode: { isValid: true }
};

const csfState = { allValid: true, securedFields: securedFieldsObj, type: 'card' };
const csfProps = { rootNode: 'div' };
const csfCallbacks = { onAllValid: null };

const CSFObj = {
    csfState,
    csfProps,
    csfCallbacks
};

const callValidateForm = () => {
    // @ts-ignore - test is faking setup object
    validateForm(CSFObj);
};

beforeEach(() => {
    console.log = jest.fn(() => {});

    csfCallbacks.onAllValid = jest.fn(() => {});
});

describe('Testing CSFs validateForm functionality', () => {
    test('Callback should be called since we are seeing a change from a valid to an invalid state', () => {
        callValidateForm();

        expect(csfCallbacks.onAllValid).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onAllValid).toHaveBeenCalledWith({ allValid: false, rootNode: 'div', type: 'card' });
    });

    test('Callback should not be called since there is no overall state change', () => {
        callValidateForm();

        // still only been called once
        expect(csfCallbacks.onAllValid).not.toHaveBeenCalled();
    });

    test('Callback should be called since everything is now valid', () => {
        securedFieldsObj.encryptedCardNumber.isValid = true;

        callValidateForm();

        expect(csfCallbacks.onAllValid).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onAllValid).toHaveBeenCalledWith({ allValid: true, rootNode: 'div', type: 'card' });
    });

    test('Callback called again since since it is always called when everything is valid', () => {
        callValidateForm();

        expect(csfCallbacks.onAllValid).toHaveBeenCalledTimes(1);
    });

    test('Callback called again since since we are changing from a valid to an invalid state', () => {
        securedFieldsObj.encryptedCardNumber.isValid = false;

        callValidateForm();

        expect(csfCallbacks.onAllValid).toHaveBeenCalledTimes(1);
        expect(csfCallbacks.onAllValid).toHaveBeenCalledWith({ allValid: false, rootNode: 'div', type: 'card' });
    });
});
