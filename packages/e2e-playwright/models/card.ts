import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';
import LANG from '../../lib/src/language/locales/en-US.json';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.encryptedCardNumber.aria.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.encryptedExpiryDate.aria.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.encryptedSecurityCode.aria.label'];

class Card {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly cardNumberField: Locator;
    readonly cardNumberErrorElement: Locator;
    readonly cardNumberInput: Locator;

    readonly expiryDateField: Locator;
    readonly expiryDateErrorElement: Locator;
    readonly expiryDateInput: Locator;

    readonly cvcField: Locator;
    readonly cvcErrorElement: Locator;
    readonly cvcInput: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-checkout__card-input') {
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        /**
         * Card Number elements, in Checkout
         */
        this.cardNumberField = this.rootElement.locator('.adyen-checkout__field--cardNumber'); // Holder
        this.cardNumberErrorElement = this.cardNumberField.locator('.adyen-checkout__error-text');

        /**
         * Card Number elements, in iframe
         */
        const cardNumberIframe = this.rootElement.frameLocator(`[title="${CARD_IFRAME_TITLE}"]`);
        this.cardNumberInput = cardNumberIframe.locator(`input[aria-label="${CARD_IFRAME_LABEL}"]`);

        /**
         * Expiry Date elements, in Checkout
         */
        this.expiryDateField = this.rootElement.locator('.adyen-checkout__field--expiryDate'); // Holder
        this.expiryDateErrorElement = this.expiryDateField.locator('.adyen-checkout__error-text'); // Related error element

        /**
         * Expiry Date elements, in iframe
         */
        const expiryDateIframe = this.rootElement.frameLocator(`[title="${EXPIRY_DATE_IFRAME_TITLE}"]`);
        this.expiryDateInput = expiryDateIframe.locator(`input[aria-label="${EXPIRY_DATE_IFRAME_LABEL}"]`);

        /**
         * Security code elements, in Checkout
         */
        this.cvcField = this.rootElement.locator('.adyen-checkout__field--securityCode'); // Holder
        this.cvcErrorElement = this.cvcField.locator('.adyen-checkout__error-text'); // Related error element

        /**
         * Security code elements, in iframe
         */
        const cvcIframe = this.rootElement.frameLocator(`[title="${CVC_IFRAME_TITLE}"]`);
        this.cvcInput = cvcIframe.locator(`input[aria-label="${CVC_IFRAME_LABEL}"]`);
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryDateInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async typeCardNumber(cardNumber: string) {
        await this.cardNumberInput.type(cardNumber, { delay: USER_TYPE_DELAY });
    }

    async deleteCardNumber() {
        await this.cardNumberInput.clear();
    }

    async typeExpiryDate(expiryDate: string) {
        await this.expiryDateInput.type(expiryDate, { delay: USER_TYPE_DELAY });
    }

    async typeCvc(cvc: string) {
        await this.cvcInput.type(cvc, { delay: USER_TYPE_DELAY });
    }
}

export { Card };
