import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';
import LANG from '../../server/translations/en-US.json';
import { Base } from './base';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.cardNumber.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];

class CustomCard extends Base {
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

    readonly cvcField: Locator;
    readonly cvcLabelText: Locator;
    readonly cvcErrorElement: Locator;
    readonly cvcInput: Locator;
    readonly cvcIframeContextualElement: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector = '.secured-fields'
    ) {
        super(page);

        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        /**
         * Card Number elements, in Checkout
         */
        this.cardNumberField = this.rootElement.locator('.pm-form-label-pan'); // Holder
        this.cardNumberLabelElement = this.cardNumberField.locator('.pm-form-label__text');
        this.cardNumberErrorElement = this.cardNumberField.locator('.pm-form-label__error-text');

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

    async typeCardNumber(cardNumber: string) {
        await this.cardNumberInput.pressSequentially(cardNumber, { delay: USER_TYPE_DELAY });
    }

    /**
     * Locator.fill:
     * - checks field is visible, enabled & editable
     * - focuses a field
     * - writes to the field's value prop
     * - fires an input event
     *
     * For most of our test cases .fill can be seen to mimic a paste event
     */
    async fillCardNumber(cardNumber: string) {
        await this.cardNumberInput.fill(cardNumber);
    }

    async deleteCardNumber() {
        await this.cardNumberInput.clear();
    }

    async deleteExpiryDate() {
        await this.expiryDateInput.clear();
    }

    async typeExpiryDate(expiryDate: string) {
        await this.expiryDateInput.pressSequentially(expiryDate, { delay: USER_TYPE_DELAY });
    }

    async typeCvc(cvc: string) {
        await this.cvcInput.pressSequentially(cvc, { delay: USER_TYPE_DELAY });
    }

    get singleBrandHolder() {
        return this.rootElement.locator('.pm-image');
    }

    get dualBrandsHolder() {
        return this.rootElement.locator('.pm-image-dual');
    }

    // Retrieve brands
    get singleBrand() {
        return this.singleBrandHolder.locator('img');
    }

    get dualBrands() {
        return this.dualBrandsHolder.locator('img').all();
    }

    async waitForVisibleBrands(expectedNumber = 2) {
        return await this.page.waitForFunction(
            expectedLength => [...document.querySelectorAll('.pm-image-dual img')].length === expectedLength,
            expectedNumber
        );
    }

    // Select one of the dual brands
    async selectBrand(
        text: string | RegExp,
        options?: {
            exact?: boolean;
        },
        force = false
    ) {
        await this.dualBrandsHolder.getByAltText(text, options).click({ force });
    }
}

export { CustomCard };
