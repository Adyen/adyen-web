import SecuredField from './SecuredField';
// import { AriaConfig } from './AbstractSecuredField';
import { CVCPolicyType, DatePolicyType } from '../types';
import Language from '../../../../../language/Language';
import LANG from '../../../../../language/locales/en-US.json';
import { ERROR_CODES, ERROR_MSG_CARD_TOO_OLD, ERROR_MSG_INVALID_FIELD, ERROR_MSG_LUHN_CHECK_FAILED } from '../../../../../core/Errors/constants';
import { ERROR_MSG_INCOMPLETE_FIELD } from '../../../../../core/Errors/constants';
import { CVC_POLICY_REQUIRED, DATE_POLICY_REQUIRED } from '../configuration/constants';

const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';
export const ENCRYPTED_SECURITY_CODE_3_DIGITS = 'encryptedSecurityCode3digits';
export const ENCRYPTED_SECURITY_CODE_4_DIGITS = 'encryptedSecurityCode4digits';

const TRANSLATED_NUMBER_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const TRANSLATED_NUMBER_IFRAME_LABEL = LANG['creditCard.encryptedCardNumber.aria.label'];

const TRANSLATED_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const TRANSLATED_DATE_IFRAME_LABEL = LANG['creditCard.encryptedExpiryDate.aria.label'];

const TRANSLATED_CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];
const TRANSLATED_CVC_IFRAME_LABEL = LANG['creditCard.encryptedSecurityCode.aria.label'];

const GENERAL_ERROR_CODE = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];
const CARD_TOO_OLD_ERROR_CODE = ERROR_CODES[ERROR_MSG_CARD_TOO_OLD];

const TRANSLATED_INCOMPLETE_FIELD_ERROR = LANG[GENERAL_ERROR_CODE];
const TRANSLATED_CARD_TOO_OLD_ERROR = LANG[CARD_TOO_OLD_ERROR_CODE];

const TRANSLATED_NUMBER_PLACEHOLDER = LANG['creditCard.numberField.placeholder'];
const TRANSLATED_DATE_PLACEHOLDER = LANG['creditCard.expiryDateField.placeholder'];
const TRANSLATED_CVC_PLACEHOLDER_3_DIGITS = LANG['creditCard.cvcField.placeholder.3digits'];
const TRANSLATED_CVC_PLACEHOLDER_4_DIGITS = LANG['creditCard.cvcField.placeholder.4digits'];

const nodeHolder = document.createElement('div');

let i18n = new Language('en-US', {});

const iframeUIConfig = {
    placeholders: null,
    sfStyles: null,
    ariaConfig: {}
};

const setupObj = {
    extraFieldData: null,
    txVariant: 'card',
    cardGroupTypes: ['amex', 'mc', 'visa'],
    iframeUIConfig,
    sfLogAtStart: false,
    trimTrailingSeparator: false,
    isCreditCardType: true,
    showWarnings: false,
    //
    fieldType: ENCRYPTED_CARD_NUMBER,
    cvcPolicy: CVC_POLICY_REQUIRED as CVCPolicyType,
    expiryDatePolicy: DATE_POLICY_REQUIRED as DatePolicyType,
    iframeSrc: null,
    loadingContext: null,
    holderEl: nodeHolder,
    legacyInputMode: null,
    minimumExpiryDate: null,
    uid: null,
    implementationType: null,
    maskSecurityCode: false
};

/**
 * AriaConfig
 */
describe('SecuredField handling ariaConfig object - should set defaults', () => {
    //
    test('Card number field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].iframeTitle).toEqual(TRANSLATED_NUMBER_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].label).toEqual(TRANSLATED_NUMBER_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(i18n.locale); // = 'en-US'
    });

    test('Date field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].iframeTitle).toEqual(TRANSLATED_DATE_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].label).toEqual(TRANSLATED_DATE_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(i18n.locale);
    });

    test('CVC field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].iframeTitle).toEqual(TRANSLATED_CVC_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].label).toEqual(TRANSLATED_CVC_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(i18n.locale);
    });
});

describe('SecuredField handling ariaConfig object - should trim the config object to match the field', () => {
    //
    test('Card number field with default ariaConfig should only have a property related to the cardNumber and nothing for date or cvc', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });

    test('cvc field, with default ariaConfig, should only have a property related to the cvc and nothing for date or number', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys relating to securedFields', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_CODES[ERROR_MSG_LUHN_CHECK_FAILED]]).not.toBe(undefined);

        // non sf-related key should not be present
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_CODES[ERROR_MSG_INVALID_FIELD]]).toBe(undefined);
    });

    test('date field, with default ariaConfig, should have expected, translated, error strings', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[ERROR_CODES[ERROR_MSG_CARD_TOO_OLD]]).toEqual(
            TRANSLATED_CARD_TOO_OLD_ERROR
        );
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys whose values are the correct translations', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(i18n.get(GENERAL_ERROR_CODE));

        const errorCode = ERROR_CODES[ERROR_MSG_LUHN_CHECK_FAILED];
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[errorCode]).toEqual(i18n.get(errorCode));
    });
});

/**
 * Placeholders
 */
describe('SecuredField handling undefined placeholders config object - should set defaults', () => {
    //
    test('Card number field with no defined placeholders config should get default value from translation field', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual(TRANSLATED_NUMBER_PLACEHOLDER);

        // Placeholders object should only contain a value for cardNumber
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });

    test('Date field with no defined placeholders config should get default value from translation field', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toEqual(TRANSLATED_DATE_PLACEHOLDER);
    });

    test('CVC field with no defined placeholders config should get default values from translation field', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toEqual(TRANSLATED_CVC_PLACEHOLDER_3_DIGITS);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toEqual(TRANSLATED_CVC_PLACEHOLDER_4_DIGITS);
    });
});

describe('SecuredField handling placeholders config object that is set to null or {} - should set defaults', () => {
    //
    test('Card number field with a placeholders config set to null should get default value from translation field', () => {
        setupObj.iframeUIConfig.placeholders = null;

        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual(TRANSLATED_NUMBER_PLACEHOLDER);
    });

    test('Date field with a placeholders config set to an empty object should get default value from translation field', () => {
        setupObj.iframeUIConfig.placeholders = {};
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toEqual(TRANSLATED_DATE_PLACEHOLDER);

        // Placeholders object should only contain a value for expiryDate
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toBe(undefined);
    });

    test('CVC field with a placeholders config set to null should get default values from translation field', () => {
        setupObj.iframeUIConfig.placeholders = null;
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toEqual(TRANSLATED_CVC_PLACEHOLDER_3_DIGITS);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toEqual(TRANSLATED_CVC_PLACEHOLDER_4_DIGITS);

        // Placeholders object should only contain a value for cvc field
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });
});

describe('SecuredField handling placeholders overridden with translations config object - overridden placeholders should be used', () => {
    //
    test('Card number field with overridden placeholder should use that value', () => {
        // expect.assertions(1);
        i18n = new Language('en-US', {
            'en-US': {
                'creditCard.numberField.placeholder': '9999 9999 9999 9999',
                'creditCard.expiryDateField.placeholder': 'mo/ye',
                'creditCard.cvcField.placeholder.3digits': 'digits3',
                'creditCard.cvcField.placeholder.4digits': 'digits4'
            }
        });

        i18n.loaded.then(() => {
            setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

            const card = new SecuredField(setupObj, i18n);
            expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual('9999 9999 9999 9999');
        });
    });

    test('Date field with overridden placeholder should use that value', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toEqual('mo/ye');
    });

    test('CVC field with overridden placeholders should use those values', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toEqual('digits3');
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toEqual('digits4');

        // Placeholders object should only contain a value for cvc
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });

    // Setting empty placeholder
    test('Card number field with overridden placeholder set to an empty string should use that value', () => {
        i18n = new Language('en-US', {
            'en-US': {
                'creditCard.numberField.placeholder': '',
                'creditCard.expiryDateField.placeholder': '',
                'creditCard.cvcField.placeholder.3digits': '',
                'creditCard.cvcField.placeholder.4digits': ''
            }
        });

        i18n.loaded.then(() => {
            setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

            const card = new SecuredField(setupObj, i18n);
            expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual('');
        });
    });

    test('CVC field with overridden placeholders set to an empty string should use those values', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toEqual('');
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toEqual('');
    });
});
