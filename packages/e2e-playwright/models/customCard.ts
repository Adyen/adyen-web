import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';
import LANG from '../../lib/src/language/locales/en-US.json';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const EXPIRY_MONTH_IFRAME_TITLE = LANG['creditCard.encryptedExpiryMonth.aria.iframeTitle'];
const EXPIRY_YEAR_IFRAME_TITLE = LANG['creditCard.encryptedExpiryYear.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.cardNumber.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.expiryDate.label'];
const EXPIRY_MONTH_IFRAME_LABEL = LANG['creditCard.expiryMonth.label'] ?? 'creditCard.expiryMonth.label'; // TODO add translation key
const EXPIRY_YEAR_IFRAME_LABEL = LANG['creditCard.expiryYear.label'] ?? 'creditCard.expiryYear.label'; // TODO add translation key
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];

class CustomCard {
    readonly page: Page;

    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly cardNumberField: Locator;
    readonly cardNumberLabelElement: Locator;
    readonly cardNumberErrorElement: Locator;
    readonly cardNumberInput: Locator;
    readonly brandingIcon: Locator;

    readonly expiryDateField: Locator;
    readonly expiryDateLabelText: Locator;
    readonly expiryDateInput: Locator;
    readonly expiryDateIframeContextualElement: Locator;
    readonly expiryDateErrorElement: Locator;

    readonly expiryMonthField: Locator;
    readonly expiryMonthLabelText: Locator;
    readonly expiryMonthErrorElement: Locator;
    readonly expiryMonthInput: Locator;
    readonly expiryMonthIframeContextualElement: Locator;

    readonly expiryYearField: Locator;
    readonly expiryYearLabelText: Locator;
    readonly expiryYearErrorElement: Locator;
    readonly expiryYearInput: Locator;
    readonly expiryYearIframeContextualElement: Locator;

    readonly cvcField: Locator;
    readonly cvcLabelText: Locator;
    readonly cvcErrorElement: Locator;
    readonly cvcInput: Locator;
    readonly cvcIframeContextualElement: Locator;

    constructor(page: Page, rootElementSelector = '.secured-fields') {
        this.page = page;

        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        /**
         * Card Number elements, in Checkout
         */
        this.cardNumberField = this.rootElement.locator('.pm-form-label-pan'); // Holder
        this.cardNumberLabelElement = this.cardNumberField.locator('.pm-form-label__text');
        this.cardNumberErrorElement = this.cardNumberField.locator('.pm-form-label__error-text');

        this.brandingIcon = this.rootElement.locator('.adyen-checkout__card__cardNumber__brandIcon');

        /**
         * Card Number elements, in iframe
         */
        const cardNumberIframe = this.rootElement.frameLocator(`[title="${CARD_IFRAME_TITLE}"]`);
        this.cardNumberInput = cardNumberIframe.locator(`input[aria-label="${CARD_IFRAME_LABEL}"]`);

        /**
         * Expiry Date elements, in Checkout
         */
        this.expiryDateField = this.rootElement.locator('.pm-form-label--exp-date'); // Holder
        this.expiryDateLabelText = this.expiryDateField.locator('.pm-form-label__text');
        this.expiryDateErrorElement = this.expiryDateField.locator('.pm-form-label__error-text'); // Related error element

        /**
         * Expiry Date elements, in iframe
         */
        const expiryDateIframe = this.rootElement.frameLocator(`[title="${EXPIRY_DATE_IFRAME_TITLE}"]`);
        this.expiryDateInput = expiryDateIframe.locator(`input[aria-label="${EXPIRY_DATE_IFRAME_LABEL}"]`);
        this.expiryDateIframeContextualElement = expiryDateIframe.locator('.aria-context');

        /**
         * Expiry Month elements, in Checkout
         */
        this.expiryMonthField = this.rootElement.locator('.pm-form-label--exp-month'); // Holder
        this.expiryMonthLabelText = this.expiryMonthField.locator('.pm-form-label__text');
        this.expiryMonthErrorElement = this.expiryMonthField.locator('.pm-form-label__error-text'); // Related error element

        /**
         * Expiry Month elements, in iframe
         */
        const expiryMonthIframe = this.rootElement.frameLocator(`[title="${EXPIRY_MONTH_IFRAME_TITLE}"]`);
        this.expiryMonthInput = expiryMonthIframe.locator(`input[aria-label="${EXPIRY_MONTH_IFRAME_LABEL}"]`);
        this.expiryMonthIframeContextualElement = expiryMonthIframe.locator('.aria-context');

        /**
         * Expiry Year elements, in Checkout
         */
        this.expiryYearField = this.rootElement.locator('.pm-form-label--exp-year'); // Holder
        this.expiryYearLabelText = this.expiryYearField.locator('.pm-form-label__text');
        this.expiryYearErrorElement = this.expiryYearField.locator('.pm-form-label__error-text');

        /**
         * Expiry Month elements, in iframe
         */
        const expiryYearIframe = this.rootElement.frameLocator(`[title="${EXPIRY_YEAR_IFRAME_TITLE}"]`);
        this.expiryYearInput = expiryYearIframe.locator(`input[aria-label="${EXPIRY_YEAR_IFRAME_LABEL}"]`);
        this.expiryYearIframeContextualElement = expiryYearIframe.locator('.aria-context');

        /**
         * Security code elements, in Checkout
         */
        this.cvcField = this.rootElement.locator('.pm-form-label--cvc'); // Holder
        this.cvcLabelText = this.cvcField.locator('.pm-form-label__text');
        this.cvcErrorElement = this.cvcField.locator('.pm-form-label__error-text'); // Related error element

        /**
         * Security code elements, in iframe
         */
        const cvcIframe = this.rootElement.frameLocator(`[title="${CVC_IFRAME_TITLE}"]`);
        this.cvcInput = cvcIframe.locator(`input[aria-label="${CVC_IFRAME_LABEL}"]`);
        this.cvcIframeContextualElement = cvcIframe.locator('.aria-context');
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryDateInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async isSeparateComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryMonthInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async typeCardNumber(cardNumber: string) {
        await this.cardNumberInput.type(cardNumber, { delay: USER_TYPE_DELAY });
    }

    async deleteCardNumber() {
        await this.cardNumberInput.clear();
    }

    async deleteExpiryDate() {
        await this.expiryDateInput.clear();
    }

    async deleteExpiryMonth() {
        await this.expiryMonthInput.clear();
    }

    async deleteExpiryYear() {
        await this.expiryYearInput.clear();
    }

    async deleteCvc() {
        await this.cvcInput.clear();
    }

    async typeExpiryDate(expiryDate: string) {
        await this.expiryDateInput.type(expiryDate, { delay: USER_TYPE_DELAY });
    }

    async typeExpiryMonth(expiryMonth: string) {
        await this.expiryMonthInput.type(expiryMonth, { delay: USER_TYPE_DELAY });
    }
    async typeExpiryYear(expiryYear: string) {
        await this.expiryYearInput.type(expiryYear, { delay: USER_TYPE_DELAY });
    }

    async typeCvc(cvc: string) {
        await this.cvcInput.type(cvc, { delay: USER_TYPE_DELAY });
    }
}

export { CustomCard };
