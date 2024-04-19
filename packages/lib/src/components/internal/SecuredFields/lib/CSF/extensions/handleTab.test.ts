import { SecuredFields } from '../../types';
import handleTab from './handleTab';
import {
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_PWD_FIELD,
    ENCRYPTED_SECURITY_CODE
} from '../../constants';
import { getPreviousTabbableNonSFElement, focusExternalField } from '../utils/tabbing/utils';
import ua from '../utils/userAgent';

ua.__IS_FIREFOX = true;

jest.mock('../utils/tabbing/utils');
//
const mockedGetPreviousTabbableNonSFElement = getPreviousTabbableNonSFElement as jest.Mock;
const mockedFocusExternalField = focusExternalField as jest.Mock;

const myCSF = {
    state: { type: 'card', securedFields: {} as SecuredFields, hasSeparateDateFields: false, numIframes: 3, isKCP: false },
    props: { rootNode: 'div' },
    handleShiftTab: handleTab.handleShiftTab,
    handleSFShiftTab: handleTab.handleSFShiftTab,
    setFocusOnFrame: jest.fn(obj => {
        console.log('### handleTab.test:::: setFocusOnFrame called with', obj);
    })
};

const instantiateMocks = () => {
    const getPreviousTabbableNonSFElementMock = jest.fn((who, rootNode) => {
        console.log('### handleTab.test::getPreviousTabbableNonSFElementMock:: called with', who, rootNode);
        return 'some-other-div';
    });

    const focusExternalFieldMock = jest.fn(what => {
        console.log('### handleTab.test::focusExternalFieldMock:: called with', what);
    });

    mockedGetPreviousTabbableNonSFElement.mockReset();
    mockedGetPreviousTabbableNonSFElement.mockImplementation((who, rootNode) => getPreviousTabbableNonSFElementMock(who, rootNode));
    getPreviousTabbableNonSFElementMock.mockClear();

    mockedFocusExternalField.mockReset();
    mockedFocusExternalField.mockImplementation(what => focusExternalFieldMock(what));
    focusExternalFieldMock.mockClear();
};

describe("Testing CSF's handleTab functionality in a regular card scenario", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        // reset
        myCSF.state.numIframes = 3;
        myCSF.state.isKCP = false;
        myCSF.state.hasSeparateDateFields = false;

        instantiateMocks();
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedExpiryDate", should see setFocusOnFrame called with "encryptedCardNumber"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_EXPIRY_DATE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_CARD_NUMBER, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedExpiryMonth", should see setFocusOnFrame called with "encryptedCardNumber"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_EXPIRY_MONTH);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_CARD_NUMBER, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedExpiryYear", should see setFocusOnFrame called with "encryptedExpiryMonth"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_EXPIRY_YEAR);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_EXPIRY_MONTH, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedSecurityCode", when hasSeparateDateFields = false, should see setFocusOnFrame called with "encryptedExpiryDate"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_SECURITY_CODE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_EXPIRY_DATE, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedSecurityCode", when hasSeparateDateFields = true, should see setFocusOnFrame called with "encryptedExpiryYear"', async () => {
        myCSF.state.hasSeparateDateFields = true;

        myCSF.handleSFShiftTab(ENCRYPTED_SECURITY_CODE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_EXPIRY_YEAR, false);
    });

    test(
        'Calling handleSFShiftTab with a fieldType = "encryptedSecurityCode", when numIframes = 1 (i.e. a storedCard scenario), ' +
            'should see getPreviousTabbableNonSFElement called with "encryptedSecurityCode", and ' +
            'focusExternalField called with the object returned from getPreviousTabbableNonSFElement',
        async () => {
            myCSF.state.numIframes = 1;

            myCSF.handleSFShiftTab(ENCRYPTED_SECURITY_CODE);
            expect(getPreviousTabbableNonSFElement).toBeCalledWith(ENCRYPTED_SECURITY_CODE, 'div');
            expect(focusExternalField).toBeCalledWith('some-other-div');
        }
    );

    test(
        'Calling handleSFShiftTab with a fieldType = "encryptedCardNumber", should see getPreviousTabbableNonSFElement called with "encryptedCardNumber", and ' +
            'focusExternalField called with the object returned from getPreviousTabbableNonSFElement',
        async () => {
            myCSF.handleSFShiftTab(ENCRYPTED_CARD_NUMBER);
            expect(getPreviousTabbableNonSFElement).toBeCalledWith(ENCRYPTED_CARD_NUMBER, 'div');
            expect(focusExternalField).toBeCalledWith('some-other-div');
        }
    );
});

describe("Testing CSF's handleTab functionality in a KCP card scenario", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        // reset
        myCSF.state.numIframes = 3;
        myCSF.state.isKCP = true;
        myCSF.state.hasSeparateDateFields = false;

        instantiateMocks();
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedExpiryDate", should see setFocusOnFrame called with "encryptedCardNumber"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_EXPIRY_DATE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_CARD_NUMBER, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedExpiryMonth", should see setFocusOnFrame called with "encryptedCardNumber"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_EXPIRY_MONTH);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_CARD_NUMBER, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedExpiryYear", should see setFocusOnFrame called with "encryptedExpiryMonth"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_EXPIRY_YEAR);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_EXPIRY_MONTH, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedSecurityCode", when hasSeparateDateFields = false, should see setFocusOnFrame called with "encryptedExpiryDate"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_SECURITY_CODE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_EXPIRY_DATE, false);
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedSecurityCode", when hasSeparateDateFields = true, should see setFocusOnFrame called with "encryptedExpiryYear"', async () => {
        myCSF.state.hasSeparateDateFields = true;

        myCSF.handleSFShiftTab(ENCRYPTED_SECURITY_CODE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_EXPIRY_YEAR, false);
    });

    test(
        'Calling handleSFShiftTab with a fieldType = "encryptedCardNumber", should see getPreviousTabbableNonSFElement called with "encryptedCardNumber", and ' +
            'focusExternalField called with the object returned from getPreviousTabbableNonSFElement',
        async () => {
            myCSF.handleSFShiftTab(ENCRYPTED_CARD_NUMBER);
            expect(getPreviousTabbableNonSFElement).toBeCalledWith(ENCRYPTED_CARD_NUMBER, 'div');
            expect(focusExternalField).toBeCalledWith('some-other-div');
        }
    );

    test(
        'Calling handleSFShiftTab with a fieldType = "encryptedPassword", should see getPreviousTabbableNonSFElement called with "encryptedCardNumber", and ' +
            'focusExternalField called with the object returned from getPreviousTabbableNonSFElement',
        async () => {
            myCSF.handleSFShiftTab(ENCRYPTED_PWD_FIELD);
            expect(getPreviousTabbableNonSFElement).toBeCalledWith(ENCRYPTED_PWD_FIELD, 'div');
            expect(focusExternalField).toBeCalledWith('some-other-div');
        }
    );
});

describe("Testing CSF's handleTab functionality in a ACH scenario", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        // reset
        myCSF.state.numIframes = 2;
        myCSF.state.type = 'ach';
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedBankLocationId", should see setFocusOnFrame called with "encryptedBankAccountNumber"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_BANK_LOCATION_FIELD);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_BANK_ACCNT_NUMBER_FIELD, false);
    });
});

describe("Testing CSF's handleTab functionality in a Giftcard scenario", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        // reset
        myCSF.state.numIframes = 2;
        myCSF.state.type = 'giftcard';

        instantiateMocks();
    });

    test('Calling handleSFShiftTab with a fieldType = "encryptedSecurityCode", should see setFocusOnFrame called with "encryptedCardNumber"', async () => {
        myCSF.handleSFShiftTab(ENCRYPTED_SECURITY_CODE);
        expect(myCSF.setFocusOnFrame).toBeCalledWith(ENCRYPTED_CARD_NUMBER, false);
    });

    test(
        'Calling handleSFShiftTab with a fieldType = "encryptedCardNumber", should see getPreviousTabbableNonSFElement called with "encryptedCardNumber", and ' +
            'focusExternalField called with the object returned from getPreviousTabbableNonSFElement',
        async () => {
            myCSF.handleSFShiftTab(ENCRYPTED_CARD_NUMBER);
            expect(getPreviousTabbableNonSFElement).toBeCalledWith(ENCRYPTED_CARD_NUMBER, 'div');
            expect(focusExternalField).toBeCalledWith('some-other-div');
        }
    );
});
