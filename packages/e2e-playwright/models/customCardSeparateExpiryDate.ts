import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';
import LANG from '../../server/translations/en-US.json';
import { CustomCard } from './customCard';

const EXPIRY_MONTH_IFRAME_TITLE = LANG['creditCard.encryptedExpiryMonth.aria.iframeTitle'];
const EXPIRY_YEAR_IFRAME_TITLE = LANG['creditCard.encryptedExpiryYear.aria.iframeTitle'];

const EXPIRY_MONTH_IFRAME_LABEL = LANG['creditCard.expiryMonth.label'] ?? 'creditCard.expiryMonth.label'; // TODO add translation key
const EXPIRY_YEAR_IFRAME_LABEL = LANG['creditCard.expiryYear.label'] ?? 'creditCard.expiryYear.label'; // TODO add translation key

class CustomCardSeparateExpiryDate extends CustomCard {
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

    constructor(
        public readonly page: Page,
        rootElementSelector = '.secured-fields-1'
    ) {
        super(page, rootElementSelector);

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
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryMonthInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async deleteExpiryMonth() {
        await this.expiryMonthInput.clear();
    }

    async deleteExpiryYear() {
        await this.expiryYearInput.clear();
    }

    async typeExpiryMonth(expiryMonth: string) {
        await this.expiryMonthInput.type(expiryMonth, { delay: USER_TYPE_DELAY });
    }
    async typeExpiryYear(expiryYear: string) {
        await this.expiryYearInput.type(expiryYear, { delay: USER_TYPE_DELAY });
    }
}

export { CustomCardSeparateExpiryDate };
