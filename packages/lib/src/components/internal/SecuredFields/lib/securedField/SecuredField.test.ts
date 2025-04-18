import SecuredField from './SecuredField';

// @ts-ignore Importing JSON for the test
import en from '../../../../../../../server/translations/en-US.json';

import { SF_ErrorCodes } from '../../../../../core/Errors/constants';
import { CVC_POLICY_REQUIRED, DATE_POLICY_REQUIRED, ENCRYPTED_PWD_FIELD, GIFT_CARD } from '../constants';
import { Placeholders as GiftcardPlaceholders } from '../../../../Giftcard/components/types';
import { Placeholders as CardPlaceholders } from '../../../../Card/components/CardInput/types';
import * as logger from '../utilities/logger';

const ENCRYPTED_CARD_NUMBER = 'encryptedCardNumber';
const ENCRYPTED_EXPIRY_DATE = 'encryptedExpiryDate';
const ENCRYPTED_SECURITY_CODE = 'encryptedSecurityCode';
export const ENCRYPTED_SECURITY_CODE_3_DIGITS = 'encryptedSecurityCode3digits';
export const ENCRYPTED_SECURITY_CODE_4_DIGITS = 'encryptedSecurityCode4digits';

const TRANSLATED_NUMBER_IFRAME_TITLE = en['creditCard.encryptedCardNumber.aria.iframeTitle'];
const TRANSLATED_NUMBER_IFRAME_LABEL = en['creditCard.cardNumber.label'];

const TRANSLATED_DATE_IFRAME_TITLE = en['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const TRANSLATED_DATE_IFRAME_LABEL = en['creditCard.expiryDate.label'];

const TRANSLATED_CVC_IFRAME_TITLE = en['creditCard.encryptedSecurityCode.aria.iframeTitle'];
const TRANSLATED_CVC_IFRAME_LABEL = en['creditCard.securityCode.label'];

const ERROR_MSG_LUHN_CHECK_FAILED = SF_ErrorCodes.ERROR_MSG_LUHN_CHECK_FAILED;

const TRANSLATED_LUHN_CHECK_FAILED_ERROR = en[ERROR_MSG_LUHN_CHECK_FAILED];

const CARD_TOO_OLD_ERROR_CODE = SF_ErrorCodes.ERROR_MSG_CARD_TOO_OLD;
const TRANSLATED_CARD_TOO_OLD_ERROR = en[CARD_TOO_OLD_ERROR_CODE];

const ERROR_MSG_INVALID_FIELD = SF_ErrorCodes.ERROR_MSG_INVALID_FIELD;
const ERROR_MSG_CARD_TOO_OLD = SF_ErrorCodes.ERROR_MSG_CARD_TOO_OLD;

const nodeHolder = document.createElement('div');

const iframeUIConfig = {
    placeholders: null,
    sfStyles: null,
    ariaConfig: {}
};

const cardPlaceholders: CardPlaceholders = {
    cardNumber: '123',
    expiryDate: '01/01',
    securityCodeThreeDigits: '000',
    securityCodeFourDigits: '1234',
    password: '***'
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
    cvcPolicy: CVC_POLICY_REQUIRED,
    expiryDatePolicy: DATE_POLICY_REQUIRED,
    iframeSrc: null,
    loadingContext: null,
    holderEl: nodeHolder,
    legacyInputMode: null,
    minimumExpiryDate: null,
    uid: null,
    implementationType: null,
    maskSecurityCode: false,
    disableIOSArrowKeys: false,
    placeholders: cardPlaceholders,
    exposeExpiryDate: false
};

/**
 * AriaConfig
 */
describe('SecuredField handling ariaConfig object - should set defaults', () => {
    test('Card number field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].iframeTitle).toEqual(TRANSLATED_NUMBER_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].label).toEqual(TRANSLATED_NUMBER_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_MSG_LUHN_CHECK_FAILED]).toEqual(
            TRANSLATED_LUHN_CHECK_FAILED_ERROR
        );
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(global.i18n.locale); // = 'en-US'
    });

    test('Date field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;

        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].iframeTitle).toEqual(TRANSLATED_DATE_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].label).toEqual(TRANSLATED_DATE_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[CARD_TOO_OLD_ERROR_CODE]).toEqual(TRANSLATED_CARD_TOO_OLD_ERROR);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(global.i18n.locale);
    });

    test('CVC field should get translated title, label & error props plus a lang prop that equals the i18n.locale', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;

        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].iframeTitle).toEqual(TRANSLATED_CVC_IFRAME_TITLE);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE].label).toEqual(TRANSLATED_CVC_IFRAME_LABEL);
        expect(card.sfConfig.iframeUIConfig.ariaConfig.lang).toEqual(global.i18n.locale);
    });
});

describe('SecuredField handling ariaConfig object - should trim the config object to match the field', () => {
    test('Card number field with default ariaConfig should only have a property related to the cardNumber and nothing for date or cvc', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).toBe(undefined);
    });

    test('cvc field, with default ariaConfig, should only have a property related to the cvc and nothing for date or number', () => {
        setupObj.fieldType = ENCRYPTED_SECURITY_CODE;
        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_SECURITY_CODE]).not.toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER]).toBe(undefined);
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE]).toBe(undefined);
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys relating to securedFields', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};

        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_MSG_LUHN_CHECK_FAILED]).not.toBe(undefined);

        // non sf-related key should not be present
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[ERROR_MSG_INVALID_FIELD]).toBe(undefined);
    });

    test('date field, with default ariaConfig, should have expected, translated, error strings', () => {
        setupObj.fieldType = ENCRYPTED_EXPIRY_DATE;
        const card = new SecuredField(setupObj, global.i18n);

        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_EXPIRY_DATE].error[ERROR_MSG_CARD_TOO_OLD]).toEqual(TRANSLATED_CARD_TOO_OLD_ERROR);
    });

    test('Card number field with default ariaConfig should have an error object containing certain keys whose values are the correct translations', () => {
        setupObj.fieldType = ENCRYPTED_CARD_NUMBER;
        setupObj.iframeUIConfig.ariaConfig = {};
        const card = new SecuredField(setupObj, global.i18n);

        const errorCode = ERROR_MSG_LUHN_CHECK_FAILED;
        expect(card.sfConfig.iframeUIConfig.ariaConfig[ENCRYPTED_CARD_NUMBER].error[errorCode]).toEqual(global.i18n.get(errorCode));
    });
});

/**
 * Placeholders
 */
describe('SecuredField handling no placeholders config object - should set defaults', () => {
    test('Card number field with no placeholders config should set all placeholders to be an empty string', () => {
        // @ts-ignore ignore
        const card = new SecuredField({ ...setupObj, placeholders: {} }, global.i18n);
        const allPlaceholders = Object.values(card.sfConfig.iframeUIConfig.placeholders);
        expect(allPlaceholders.every(placeholder => placeholder === '')).toBe(true);
    });
});

describe('SecuredField handling placeholders from the placeholders config', () => {
    const giftCardPlaceholders: GiftcardPlaceholders = { cardNumber: '123', expiryDate: '01/01', securityCode: '000' };

    test('should set placeholders for txVariant gift card (cardNumber field)', () => {
        // @ts-ignore ignore
        const giftCard = new SecuredField({ ...setupObj, txVariant: GIFT_CARD }, global.i18n, giftCardPlaceholders);
        expect(giftCard.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(giftCardPlaceholders.cardNumber);
    });

    test('should set placeholders for txVariant gift card (expiryDate field)', () => {
        // @ts-ignore ignore
        const giftCard = new SecuredField(
            { ...setupObj, txVariant: GIFT_CARD, fieldType: ENCRYPTED_EXPIRY_DATE, placeholders: giftCardPlaceholders },
            global.i18n
        );
        expect(giftCard.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(giftCardPlaceholders.expiryDate);
    });

    test('should set placeholders for txVariant gift card (securityCode field)', () => {
        // @ts-ignore ignore
        const giftCard = new SecuredField(
            { ...setupObj, txVariant: GIFT_CARD, fieldType: ENCRYPTED_SECURITY_CODE, placeholders: giftCardPlaceholders },
            global.i18n
        );
        expect(giftCard.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE]).toBe(giftCardPlaceholders.securityCode);
    });

    test('should set placeholders for cardNumber field for txVariant default (card)', () => {
        // @ts-ignore ignore
        const card = new SecuredField(setupObj, global.i18n, cardPlaceholders);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_CARD_NUMBER]).toBe(cardPlaceholders.cardNumber);
    });

    test('should set placeholders for expiryDate field for txVariant default (card)', () => {
        // @ts-ignore ignore
        const card = new SecuredField({ ...setupObj, fieldType: ENCRYPTED_EXPIRY_DATE }, global.i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_EXPIRY_DATE]).toBe(cardPlaceholders.expiryDate);
    });

    test('should set placeholders for securityCode field for txVariant default (card)', () => {
        // @ts-ignore ignore
        const card = new SecuredField({ ...setupObj, fieldType: ENCRYPTED_SECURITY_CODE }, global.i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_3_DIGITS]).toBe(cardPlaceholders.securityCodeThreeDigits);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_SECURITY_CODE_4_DIGITS]).toBe(cardPlaceholders.securityCodeFourDigits);
    });

    test('should set placeholders for password field for txVariant default (card)', () => {
        // @ts-ignore ignore
        const card = new SecuredField({ ...setupObj, fieldType: ENCRYPTED_PWD_FIELD }, global.i18n);
        expect(card.sfConfig.iframeUIConfig.placeholders[ENCRYPTED_PWD_FIELD]).toBe(cardPlaceholders.password);
    });

    /**
     * Testing postMessageListenerFn
     */
    describe('Testing SecuredField postMessageListenerFn', () => {
        const origin = 'https://checkoutshopper-test.adyen.com';
        let card: any;
        let data: any;
        let myCallback: any;
        let warningMsg: string;
        let loggingMsg: string;

        beforeEach(() => {
            setupObj.loadingContext = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
            card = new SecuredField({ ...setupObj }, global.i18n);
            data = {
                action: '',
                fieldType: 'encryptedSecurityCode',
                numKey: card.numKey
            };
            myCallback = jest.fn(() => {});

            warningMsg = '';
            // @ts-ignore - allow assignment, it's only a test!
            console.warn = logger.warn = jest.fn(msg => {
                // console.log('msg=', msg);
                warningMsg = msg;
            });

            loggingMsg = '';
            // @ts-ignore - allow assignment, it's only a test!
            console.log = logger.log = jest.fn(msg => {
                loggingMsg = msg;
            });
        });

        test('Check postMessageListenerFn is called and that origin is validated', () => {
            const messageEvent = {
                origin,
                data: JSON.stringify({})
            };

            const postMessageListenerFnSpy = jest.spyOn(card, 'postMessageListenerFn');

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(postMessageListenerFnSpy).toHaveBeenCalledTimes(1);
            expect(postMessageListenerFnSpy).toHaveBeenCalledWith(messageEvent);
        });

        test('Check that mismatching origins are detected', () => {
            const messageEvent = {
                origin: 'http://localhost',
                data: JSON.stringify({})
            };

            card.sfConfig = { showWarnings: true };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(warningMsg.includes('WARNING postMessageValidation: postMessage listener for iframe::origin mismatch')).toEqual(true);
        });

        test('Check that non JSON data is detected', () => {
            const messageEvent = {
                origin,
                data: {}
            };

            card.sfConfig = { showWarnings: true };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(loggingMsg.includes('SecuredField::postMessageListenerFn:: PARSE FAIL - UNKNOWN REASON')).toEqual(true);
        });

        test('Check that malformed data is detected', () => {
            delete data.action;

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            card.sfConfig = { showWarnings: true };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(warningMsg.includes('WARNING SecuredField :: postMessage listener for iframe :: data mismatch!')).toEqual(true);
        });

        test('Check that mismatching numKeys are detected', () => {
            data.numKey = 12345;

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            card.sfConfig = { showWarnings: true };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(
                warningMsg.includes(
                    'WARNING SecuredField :: postMessage listener for iframe :: data mismatch! (Probably a message from an unrelated securedField)'
                )
            ).toEqual(true);
        });

        test('Check callback is called after "encryption" action', () => {
            expect(card.isValid).toEqual(false);

            card.onEncryption(myCallback);

            // Encryption action
            data.action = 'encryption';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);

            // Should be valid after an encryption action
            expect(card.isValid).toEqual(true);
        });

        test('Check callback is called after "config" action', () => {
            card.onConfig(myCallback);

            // Set action
            data.action = 'config';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "focus" action', () => {
            card.onFocus(myCallback);

            // Set action
            data.action = 'focus';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "binValue" action', () => {
            card.onBinValue(myCallback);

            // Set action
            data.action = 'binValue';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "touch" action', () => {
            card.onTouchstart(myCallback);

            // Set action
            data.action = 'touch';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "shifttab" action', () => {
            card.onShiftTab(myCallback);

            // Set action
            data.action = 'shifttab';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "autoComplete" action', () => {
            card.onAutoComplete(myCallback);

            // Set action
            data.action = 'autoComplete';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "enterKeyPressed" action', () => {
            card.onKeyPressed(myCallback);

            // Set action
            data.action = 'enterKeyPressed';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);
        });

        test('Check callback is called after "brand" action', () => {
            card.isValid = true; // mock card already being valid

            card.onValidation(myCallback);

            // Set action
            data.action = 'brand';

            const messageEvent = {
                origin,
                data: JSON.stringify(data)
            };

            // @ts-ignore event type
            card.postMessageListenerFn(messageEvent);

            expect(myCallback).toHaveBeenCalledTimes(1);
            expect(myCallback).toHaveBeenCalledWith(data);

            // Should not be valid after an encryption action
            expect(card.isValid).toEqual(false);
        });
    });
});
