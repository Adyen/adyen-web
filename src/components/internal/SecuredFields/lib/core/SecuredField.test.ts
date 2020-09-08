import SecuredField from './SecuredField';
import { AriaConfig } from './AbstractSecuredField';
import Language from '../../../../../language/Language';
import { IFRAME_TITLE } from '../configuration/constants';
import LANG from '../../../../../language/locales/nl-NL.json';
import { ERROR_CODES, ERROR_MSG_CARD_TOO_OLD, ERROR_MSG_INVALID_FIELD, ERROR_MSG_LUHN_CHECK_FAILED } from '../../../../../core/Errors/constants';
import { ERROR_MSG_INCOMPLETE_FIELD } from '../../../../../core/Errors/constants';

const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';

const GENERAL_ERROR_CODE = ERROR_CODES[ERROR_MSG_INCOMPLETE_FIELD];

const TRANSLATED_INCOMPLETE_FIELD_ERROR = LANG[GENERAL_ERROR_CODE];

const TRANSLATED_NUMBER_PLACEHOLDER = LANG['creditCard.numberField.placeholder'];
const TRANSLATED_DATE_PLACEHOLDER = LANG['creditCard.expiryDateField.placeholder'];
const TRANSLATED_CVC_PLACEHOLDER = LANG['creditCard.cvcField.placeholder'];

const nodeHolder = document.createElement('div');

const i18n = new Language('nl-NL', {});

const mockAriaConfig = {
    lang: 'en-GB',
    encryptedCardNumber: {
        label: 'Credit or debit card number field',
        iframeTitle: 'Iframe for credit card number field'
    },
    encryptedExpiryDate: {
        label: 'Credit or debit card expiration date field',
        error: { [GENERAL_ERROR_CODE]: 'Field is not filled out' }
    },
    encryptedSecurityCode: {
        label: 'Credit or debit card 3 or 4 digit security code field'
    }
} as AriaConfig;

const mockPlaceholders = {
    encryptedCardNumber: '9999 9999 9999 9999',
    encryptedExpiryDate: 'MM/YY',
    encryptedSecurityCode: 999
};

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
    cvcRequired: true,
    iframeSrc: null,
    loadingContext: null,
    holderEl: nodeHolder
};

/**
 * AriaConfig
 */
describe('SecuredField handling ariaConfig object - should set defaults', () => {
    //
    test('Card number field with no defined ariaConfig should get default title & translated error props', () => {
        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].iframeTitle).toEqual(IFRAME_TITLE);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
    });

    test('Date field with no defined ariaConfig should get default title & translated error props', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].iframeTitle).toEqual(IFRAME_TITLE);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
    });

    test('CVC field with no defined ariaConfig should get default title & translated error props', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].iframeTitle).toEqual(IFRAME_TITLE);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
    });
});

describe('SecuredField handling ariaConfig object - should set defaults only where they are not already defined', () => {
    //
    test('Card number field with ariaConfig with label & iframeTitle should preserve these props and also get a translated error prop', () => {
        setupObj.iframeUIConfig.ariaConfig = mockAriaConfig;
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].label).toEqual(mockAriaConfig[ENCRYPTED_CARD_NUMBER].label);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].iframeTitle).toEqual(mockAriaConfig[ENCRYPTED_CARD_NUMBER].iframeTitle);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);

        // Also check that configured language is preserved
        expect(card.config.iframeUIConfig.ariaConfig.lang).toEqual(mockAriaConfig.lang);
    });

    test('Date field with ariaConfig with label & error should preserve these props and also get a iframeTitle prop', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].label).toEqual(mockAriaConfig[ENCRYPTED_EXPIRY_DATE].label);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].iframeTitle).toEqual(IFRAME_TITLE);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual(
            mockAriaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]
        );
    });

    test('CVC field with ariaConfig with label should preserve this prop and also get default title & translated error props', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].label).toEqual(mockAriaConfig[ENCRYPTED_SECURITY_CODE].label);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].iframeTitle).toEqual(IFRAME_TITLE);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
    });
});

describe('SecuredField handling ariaConfig object - should trim the config object to match the field', () => {
    //
    test('Card number field with default ariaConfig should only have a property related to the cardNumber and nothing for date or cvc', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, i18n);

        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });

    test('cvc field, with defined ariaConfig, should only have a property related to the cvc and nothing for date or cvc', () => {
        setupObj.iframeUIConfig.ariaConfig = mockAriaConfig;
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);

        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys relating to securedFields', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, i18n);

        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).not.toBe(undefined);
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_CODES[ERROR_MSG_LUHN_CHECK_FAILED]]).not.toBe(undefined);

        // non sf-related key should not be present
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_CODES[ERROR_MSG_INVALID_FIELD]]).toBe(undefined);
    });

    test('date field, with defined ariaConfig, should have its own defined error object', () => {
        setupObj.iframeUIConfig.ariaConfig = mockAriaConfig;
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);

        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual('Field is not filled out');

        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[ERROR_CODES[ERROR_MSG_CARD_TOO_OLD]]).toBe(undefined);
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys whose values are the correct translations', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, i18n);

        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(i18n.get(GENERAL_ERROR_CODE));

        const errorCode = ERROR_CODES[ERROR_MSG_LUHN_CHECK_FAILED];
        expect(card.config.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[errorCode]).toEqual(i18n.get(errorCode));
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
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual(TRANSLATED_NUMBER_PLACEHOLDER);

        // Placeholders object should only contain a value for cardNumber
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });

    test('Date field with no defined placeholders config should get default value from translation field', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toEqual(TRANSLATED_DATE_PLACEHOLDER);
    });

    test('CVC field with no defined placeholders config should get default value from translation field', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toEqual(TRANSLATED_CVC_PLACEHOLDER);
    });
});

describe('SecuredField handling placeholders config object that is set to null or {} - should set defaults', () => {
    //
    test('Card number field with a placeholders config set to null should get default value from translation field', () => {
        setupObj.iframeUIConfig.placeholders = null;

        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual(TRANSLATED_NUMBER_PLACEHOLDER);
    });

    test('Date field with a placeholders config set to an empty object should get default value from translation field', () => {
        setupObj.iframeUIConfig.placeholders = {};
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toEqual(TRANSLATED_DATE_PLACEHOLDER);

        // Placeholders object should only contain a value for expiryDate
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });
});

describe('SecuredField handling placeholders config object - defined placeholder should be preserved', () => {
    //
    test('Card number field with defined placeholders should keep that value', () => {
        setupObj.iframeUIConfig.placeholders = mockPlaceholders;
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual(mockPlaceholders[ENCRYPTED_CARD_NUMBER]);
    });

    test('Date field with defined placeholders should keep that value', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toEqual(mockPlaceholders[ENCRYPTED_EXPIRY_DATE]);
    });

    test('CVC field with defined placeholders should keep that value', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toEqual(mockPlaceholders[ENCRYPTED_SECURITY_CODE]);

        // Placeholders object should only contain a value for cvc
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });

    // Setting empty placeholder
    test('Card number field with defined placeholders set to an empty string should keep that value', () => {
        setupObj.iframeUIConfig.placeholders.encryptedCardNumber = '';
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual('');
    });

    test('Card number field with defined placeholders set to null should keep that value', () => {
        setupObj.iframeUIConfig.placeholders.encryptedCardNumber = null;

        const card = new SecuredField(setupObj, i18n);
        expect(card.config.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toEqual(null);
    });
});
