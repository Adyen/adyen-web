import { setupSecuredField } from './createSecuredFields';
import { DATA_ENCRYPTED_FIELD_ATTR } from '../../configuration/constants';
import { SecuredFields } from '../../types';
import Language from '../../../../../../language';
// import SecuredField from '../../securedField/SecuredField';

// jest.mock('../../securedField/SecuredField');

// const mockedSecuredField = SecuredField as jest.Mock;

const myCSF = {
    state: { type: 'card', hasSeparateDateFields: null, securedFields: {} as SecuredFields },
    config: {},
    props: { i18n: new Language('en-US', {}) },
    setupSecuredField,
    encryptedAttrName: DATA_ENCRYPTED_FIELD_ATTR
};

describe('Testing CSFs setupSecuredField functionality', () => {
    // const SecuredFieldMock = jest.fn(() => ({
    //     onIframeLoaded: () => ({
    //         onConfig: () => ({
    //             onFocus: () => ({
    //                 onBinValue: () => ({
    //                     onTouchstart: () => ({
    //                         onShiftTab: () => ({
    //                             onEncryption: () => ({
    //                                 onValidation: () => ({
    //                                     onAutoComplete: () => ({})
    //                                 })
    //                             })
    //                         })
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // }));
    beforeEach(() => {
        console.log = jest.fn(() => {});

        // mockedSecuredField.mockReset();
        // mockedSecuredField.mockImplementation(() => SecuredFieldMock());
        // SecuredFieldMock.mockClear();
    });

    test('Calling setupSecuredField...', () => {
        const myDiv = document.createElement('div');
        myDiv.setAttribute(DATA_ENCRYPTED_FIELD_ATTR, 'encryptedCardNumber');

        console.log('### createSecuredFields.test:::: myDiv', myDiv);

        myCSF.setupSecuredField(myDiv);

        expect(myCSF.state.securedFields.encryptedCardNumber).not.toEqual(null);
    });

    test('Calling setupSecuredField...', () => {
        const myDiv = document.createElement('div');
        myDiv.setAttribute(DATA_ENCRYPTED_FIELD_ATTR, 'encryptedExpiryYear');

        console.log('### createSecuredFields.test:::: myDiv', myDiv);

        myCSF.setupSecuredField(myDiv);

        expect(myCSF.state.hasSeparateDateFields).toEqual(true);
        expect(myCSF.state.securedFields.encryptedExpiryYear).not.toEqual(null);
    });
});
