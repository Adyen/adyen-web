import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import handleBrandFromBinLookup, { sendBrandToCardSF, sendExpiryDatePolicyToSF } from './handleBrandFromBinLookup';

jest.mock('../utils/iframes/postMessageToIframe');

const mockedPostMessageToIframe = postMessageToIframe as jest.Mock;

const securedFieldsObj: any = {
    encryptedCardNumber: { numKey: 654321 },
    encryptedExpiryDate: { expiryDatePolicy: null, numKey: 654321 },
    encryptedSecurityCode: { cvcPolicy: null, numKey: 654321 }
};

const myCSF = {
    state: { type: 'card', securedFields: securedFieldsObj },
    config: {},
    handleBrandFromBinLookup,
    sendBrandToCardSF,
    sendExpiryDatePolicyToSF,
    validateForm: null,
    processBrand: null
};

const binLookupResponseObj: any = {
    issuingCountryCode: 'US',
    supportedBrands: [
        {
            brand: 'mc',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'MasterCard',
            paymentMethodVariant: 'mcdebit',
            showSocialSecurityNumber: false,
            supported: true
        }
    ]
};

const nonGenericCard_resetObj = {
    brand: 'bcmc',
    cvcPolicy: 'hidden'
};

// //////////

const expectedProcessBrandObj = {
    brand: 'mc',
    cvcPolicy: 'required',
    expiryDatePolicy: 'required',
    cvcText: 'Security code',
    showSocialSecurityNumber: false,
    fieldType: 'encryptedCardNumber'
};

const expectedProcessBrand_resetObj = {
    brand: 'bcmc',
    cvcPolicy: 'hidden',
    fieldType: 'encryptedCardNumber'
};

const expectedSendBrandToCardSFObj = {
    txVariant: 'card',
    brand: 'mc',
    enableLuhnCheck: true,
    fieldType: 'encryptedCardNumber',
    numKey: 654321
};

const expectedSendExpiryDatePolicyToSF_expiryDateObj: any = {
    txVariant: 'card',
    expiryDatePolicy: 'required',
    fieldType: 'encryptedExpiryDate',
    numKey: 654321
};

const expectedSendExpiryDatePolicyToSF_expiryMonthObj: any = {
    txVariant: 'card',
    expiryDatePolicy: 'required',
    fieldType: 'encryptedExpiryMonth',
    numKey: 654321
};

const expectedSendExpiryDatePolicyToSF_expiryYearObj: any = {
    txVariant: 'card',
    expiryDatePolicy: 'required',
    fieldType: 'encryptedExpiryYear',
    numKey: 654321
};

const expectedSendBrandToCardSF_resetObj = {
    txVariant: 'card',
    brand: 'reset',
    fieldType: 'encryptedCardNumber',
    numKey: 654321
};

describe('Testing CSFs handleBrandFromBinLookup functionality', () => {
    const postMessageToIframeMock = jest.fn(obj => console.log('### handleEncryption.test::Mock FN call to postMessageToIframe:: ', obj));

    beforeEach(() => {
        console.log = jest.fn(() => {});

        mockedPostMessageToIframe.mockReset();
        mockedPostMessageToIframe.mockImplementation(obj => postMessageToIframeMock(obj));
        postMessageToIframeMock.mockClear();

        myCSF.processBrand = jest.fn(obj => {
            console.log('### handleBrandFromBinLookup.test::myCSF.processBrand:: obj', obj);
        });

        myCSF.validateForm = jest.fn(() => {
            console.log('### handleBrandFromBinLookup.test::myCSF.validateForm:: ');
        });
    });

    test(
        'Calling handleBrandFromBinLookup with a binLookupResponse object inside a regular card component should make the expected calls to ' +
            'processBrand & validateForm, send postMsgs to set brand & expiryDatePolicy on the card and expiryDate SFs respectively, and set cvcPolicy & expiryDatePolicy in state',
        () => {
            myCSF.handleBrandFromBinLookup(binLookupResponseObj, null);

            expect(myCSF.processBrand).toHaveBeenCalledWith(expectedProcessBrandObj);

            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendBrandToCardSFObj);
            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendExpiryDatePolicyToSF_expiryDateObj);

            expect(myCSF.state.securedFields.encryptedSecurityCode.cvcPolicy).toEqual('required');
            expect(myCSF.state.securedFields.encryptedExpiryDate.expiryDatePolicy).toEqual('required');

            expect(myCSF.validateForm).toHaveBeenCalled();
        }
    );

    test(
        'Calling handleBrandFromBinLookup with a binLookupResponse object inside a custom card component should make the expected calls to ' +
            'processBrand & validateForm, send postMsgs to set brand on the card SF & expiryDatePolicy on the expiryMonth & expiryYear SFs, and set cvcPolicy & expiryDatePolicy in state',
        () => {
            // reconfigure state.securedFields to reflect a custom card setup
            delete myCSF.state.securedFields.encryptedExpiryDate;

            myCSF.state.securedFields.encryptedExpiryMonth = { expiryDatePolicy: null, numKey: 654321 };
            myCSF.state.securedFields.encryptedExpiryYear = { expiryDatePolicy: null, numKey: 654321 };

            myCSF.handleBrandFromBinLookup(binLookupResponseObj, null);

            expect(myCSF.processBrand).toHaveBeenCalled();
            expect(postMessageToIframeMock).toHaveBeenCalled();

            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendExpiryDatePolicyToSF_expiryMonthObj);
            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendExpiryDatePolicyToSF_expiryYearObj);

            expect(myCSF.state.securedFields.encryptedSecurityCode.cvcPolicy).toEqual('required');
            expect(myCSF.state.securedFields.encryptedExpiryMonth.expiryDatePolicy).toEqual('required');
            expect(myCSF.state.securedFields.encryptedExpiryYear.expiryDatePolicy).toEqual('required');

            expect(myCSF.validateForm).toHaveBeenCalled();
        }
    );

    test(
        'Calling handleBrandFromBinLookup without a binLookupResponse object or a reset object, on a custom card, ' +
            'should see that postMsgs are set to reset brand on the card SF and expiryDatePolicy on the expiryMonth & expiryYear SFs, ' +
            'and processBrand & validateForm are not called',
        () => {
            // @ts-ignore it's a mock scenario!
            myCSF.handleBrandFromBinLookup({}, null);

            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendBrandToCardSF_resetObj);
            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendExpiryDatePolicyToSF_expiryMonthObj);
            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendExpiryDatePolicyToSF_expiryYearObj);

            expect(myCSF.processBrand).not.toHaveBeenCalled();
            expect(myCSF.validateForm).not.toHaveBeenCalled();
        }
    );

    test(
        'Calling handleBrandFromBinLookup without a binLookupResponse object or a reset object, on a regular card, ' +
            'should see that postMsgs are set to reset brand and expiryDatePolicy on the SFs, ' +
            'expiryDatePolicy is reset in local state, and processBrand & validateForm are not called',
        () => {
            // reconfigure state.securedFields to revert it back to a regular card setup
            delete myCSF.state.securedFields.encryptedExpiryMonth;
            delete myCSF.state.securedFields.encryptedExpiryYear;

            myCSF.state.securedFields.encryptedExpiryDate = { expiryDatePolicy: null, numKey: 654321 };

            // @ts-ignore it's a mock scenario!
            myCSF.handleBrandFromBinLookup({}, null);

            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendBrandToCardSF_resetObj);
            expect(postMessageToIframeMock).toHaveBeenCalledWith(expectedSendExpiryDatePolicyToSF_expiryDateObj);

            expect(myCSF.state.securedFields.encryptedExpiryDate.expiryDatePolicy).toEqual('required');

            expect(myCSF.processBrand).not.toHaveBeenCalled();
            expect(myCSF.validateForm).not.toHaveBeenCalled();
        }
    );

    test(
        'Calling handleBrandFromBinLookup without a binLookupResponse object or a reset object, when state.type is not the generic value "card", ' +
            'should see that postMsgs are not sent, expiryDatePolicy is not reset in local state, and processBrand & validateForm are not called',
        () => {
            myCSF.state.securedFields.encryptedExpiryDate.expiryDatePolicy = null;
            myCSF.state.type = 'mc';

            myCSF.handleBrandFromBinLookup(null, null);

            expect(postMessageToIframeMock).not.toHaveBeenCalled();
            expect(postMessageToIframeMock).not.toHaveBeenCalled();

            expect(myCSF.state.securedFields.encryptedExpiryDate.expiryDatePolicy).toEqual(null); // not been set to 'required'

            expect(myCSF.processBrand).not.toHaveBeenCalled();
            expect(myCSF.validateForm).not.toHaveBeenCalled();
        }
    );

    test(
        'Calling handleBrandFromBinLookup without a binLookupResponse object but with a reset object, when state.type is not the generic value "card", ' +
            'should see processBrand called with the expect "reset" object, postMsgs are not sent, expiryDatePolicy is not reset in local state, ' +
            'and validateForm is not called',
        () => {
            myCSF.state.type = 'bcmc';

            // @ts-ignore it's a mock scenario!
            myCSF.handleBrandFromBinLookup(null, nonGenericCard_resetObj);

            expect(myCSF.processBrand).toHaveBeenCalledWith(expectedProcessBrand_resetObj);

            expect(postMessageToIframeMock).not.toHaveBeenCalled();
            expect(postMessageToIframeMock).not.toHaveBeenCalled();

            expect(myCSF.state.securedFields.encryptedExpiryDate.expiryDatePolicy).toEqual(null);

            expect(myCSF.validateForm).not.toHaveBeenCalled();
        }
    );
});
