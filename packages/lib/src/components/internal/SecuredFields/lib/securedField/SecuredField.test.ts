import SecuredField from './SecuredField';
import { CVCPolicyType, DatePolicyType } from '../types';
import Language from '../../../../../language/Language';
// @ts-ignore ignore
import LANG from '../../../../../language/locales/en-US.json';
import { ERROR_CODES, ERROR_MSG_CARD_TOO_OLD, ERROR_MSG_INVALID_FIELD, ERROR_MSG_LUHN_CHECK_FAILED } from '../../../../../core/Errors/constants';
import { ERROR_MSG_INCOMPLETE_FIELD } from '../../../../../core/Errors/constants';
import {
    CVC_POLICY_REQUIRED,
    DATE_POLICY_REQUIRED,
    ENCRYPTED_BANK_ACCNT_NUMBER_FIELD,
    ENCRYPTED_BANK_LOCATION_FIELD,
    ENCRYPTED_PWD_FIELD,
    GIFT_CARD
} from '../configuration/constants';
import { Placeholders as AchPlaceholders } from '../../../../Ach/components/AchInput/types';
import { Placeholders as GiftcardPlaceholders } from '../../../../Giftcard/components/types';
import { Placeholders as CardPlaceholders } from '../../../../Card/components/CardInput/types';

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

const nodeHolder = document.createElement('div');

const i18n = new Language('en-US', {});

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
    test('Card number field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].iframeTitle).toEqual(TRANSLATED_NUMBER_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].label).toEqual(TRANSLATED_NUMBER_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(i18n.locale); // = 'en-US'
    });

    test('Date field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].iframeTitle).toEqual(TRANSLATED_DATE_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].label).toEqual(TRANSLATED_DATE_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(i18n.locale);
    });

    test('CVC field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].iframeTitle).toEqual(TRANSLATED_CVC_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].label).toEqual(TRANSLATED_CVC_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(i18n.locale);
    });
});

describe('SecuredField handling ariaConfig object - should trim the config object to match the field', () => {
    test('Card number field with default ariaConfig should only have a property related to the cardNumber and nothing for date or cvc', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });

    test('cvc field, with default ariaConfig, should only have a property related to the cvc and nothing for date or number', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys relating to securedFields', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_CODES[ERROR_MSG_LUHN_CHECK_FAILED]]).not.toBe(undefined);

        // non sf-related key should not be present
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_CODES[ERROR_MSG_INVALID_FIELD]]).toBe(undefined);
    });

    test('date field, with default ariaConfig, should have expected, translated, error strings', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[GENERAL_ERROR_CODE]).toEqual(TRANSLATED_INCOMPLETE_FIELD_ERROR);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[ERROR_CODES[ERROR_MSG_CARD_TOO_OLD]]).toEqual(
            TRANSLATED_CARD_TOO_OLD_ERROR
        );
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys whose values are the correct translations', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[GENERAL_ERROR_CODE]).toEqual(i18n.get(GENERAL_ERROR_CODE));

        const errorCode = ERROR_CODES[ERROR_MSG_LUHN_CHECK_FAILED];
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[errorCode]).toEqual(i18n.get(errorCode));
    });
});

/**
 * Placeholders
 */
describe('SecuredField handling no placeholders config object - should set defaults', () => {
    test('Card number field with no placeholders config should set all placeholders to be an empty string', () => {
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n);
        const allPlaceholders = Object.values(card.sfConfig.iframeUIConfig.placeholders);
        expect(allPlaceholders.every(placeholder => placeholder === '')).toBe(true);
    });
});

describe('SecuredField handling placeholders from the placeholders config', () => {
    test('should set placeholders for txVariant ach', () => {
        const achPlaceholders: AchPlaceholders = { accountNumber: '123', accountLocation: 'abc' };
        // @ts-ignore ignore
        const ach = new SecuredField({ ...setupObj, txVariant: 'ach' }, i18n, achPlaceholders);
        expect(ach.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_BANK_ACCNT_NUMBER_FIELD]).toBe(achPlaceholders.accountNumber);
        expect(ach.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_BANK_LOCATION_FIELD]).toBe(achPlaceholders.accountLocation);
    });

    test('should set placeholders for txVariant gift card', () => {
        const giftCardPlaceholders: GiftcardPlaceholders = { cardNumber: '123', expiryDate: '01/01', securityCode: '000' };
        // @ts-ignore ignore
        const giftCard = new SecuredField({ ...setupObj, txVariant: GIFT_CARD }, i18n, giftCardPlaceholders);
        expect(giftCard.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(giftCardPlaceholders.cardNumber);
        expect(giftCard.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(giftCardPlaceholders.expiryDate);
        expect(giftCard.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toBe(giftCardPlaceholders.securityCode);
    });

    test('should set placeholders for txVariant default (card)', () => {
        const cardPlaceholders: CardPlaceholders = {
            cardNumber: '123',
            expiryDate: '01/01',
            securityCodeThreeDigits: '000',
            securityCodeFourDigits: '1234',
            password: '***'
        };
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, i18n, cardPlaceholders);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(cardPlaceholders.cardNumber);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(cardPlaceholders.expiryDate);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toBe(cardPlaceholders.securityCodeThreeDigits);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toBe(cardPlaceholders.securityCodeFourDigits);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_PWD_FIELD]).toBe(cardPlaceholders.password);
    });
});
