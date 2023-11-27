import validateForm from './validateForm';

const securedFieldsObj = {
    encryptedCardNumber: { isValid: false },
    encryptedExpiryDate: { isValid: true },
    encryptedSecurityCode: { isValid: true }
};

const csfState = { allValid: false, securedFields: securedFieldsObj };
const csfProps = {};
const csfConfig = {};
const csfCallbacks = { onAllValid: null };

const CSFObj = {
    csfState,
    csfProps,
    csfConfig,
    csfCallbacks
};

csfCallbacks.onAllValid = jest.fn(() => {
    return true;
});

beforeEach(() => {
    // console.log = jest.fn(() => {});
    // csfCallbacks.onAllValid = jest.fn(() => {
    //     return true;
    // });
});

describe('Testing CSFs validateForm functionality', () => {
    test('Callback should not be called since csfState.allValid is false; and a securedField that is also not valid will not lead to a change in this state', () => {
        // @ts-ignore - test is faking setup object
        validateForm(CSFObj);

        expect(csfCallbacks.onAllValid).not.toHaveBeenCalled();
    });

    test('Callback should be called since the securedField is now valid and this will represent an overall state change', () => {
        securedFieldsObj.encryptedCardNumber.isValid = true;
        // @ts-ignore - test is faking setup object
        validateForm(CSFObj);

        expect(csfCallbacks.onAllValid).toHaveBeenCalledTimes(1);
    });

    test('Callback should not be called since everything is still valid so there is no overall state change', () => {
        // @ts-ignore - test is faking setup object
        validateForm(CSFObj);

        expect(csfCallbacks.onAllValid).toHaveBeenCalledTimes(2);
    });
});
