import { setupSecuredField } from './createSecuredFields';
import { DATA_ENCRYPTED_FIELD_ATTR } from '../../configuration/constants';
import { SecuredFields } from '../../types';
import Language from '../../../../../../language';

const myCSF = {
    state: { type: 'card', hasSeparateDateFields: null, securedFields: {} as SecuredFields },
    config: {},
    props: { i18n: new Language('en-US', {}) },
    setupSecuredField,
    encryptedAttrName: DATA_ENCRYPTED_FIELD_ATTR
};

describe('Testing CSFs setupSecuredField functionality', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});
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
