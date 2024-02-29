import {
    SF_ErrorCodes,
    ERROR_FIELD_REQUIRED,
    ERROR_FIELD_INVALID,
    ERROR_INVALID_FORMAT_EXPECTS,
    CREDITCARD_HOLDER_NAME_INVALID,
    BOLETO_SOCIAL_SECURITY_NUMBER_INVALID
} from './constants';
import en from '../../language/locales/en-US';

describe('Testing alignment between ErrorCodes constants and translation files', () => {
    Object.values(SF_ErrorCodes).forEach(val => {
        test('Should see that each value has a corresponding translation', () => {
            expect(en[val]).not.toBe(undefined);
        });
    });

    test('Should see that other constants have a corresponding translation', () => {
        expect(en[ERROR_FIELD_REQUIRED]).not.toBe(undefined);
        expect(en[ERROR_FIELD_INVALID]).not.toBe(undefined);
        expect(en[ERROR_INVALID_FORMAT_EXPECTS]).not.toBe(undefined);
        expect(en[CREDITCARD_HOLDER_NAME_INVALID]).not.toBe(undefined);
        expect(en[BOLETO_SOCIAL_SECURITY_NUMBER_INVALID]).not.toBe(undefined);
    });
});
