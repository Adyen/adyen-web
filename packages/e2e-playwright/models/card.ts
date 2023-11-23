import { Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';
import LANG from '../../lib/src/language/locales/en-US.json';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.encryptedCardNumber.aria.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.encryptedExpiryDate.aria.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.encryptedSecurityCode.aria.label'];

const INSTALLMENTS_PAYMENTS = LANG['installments.installments'];
const REVOLVING_PAYMENT = LANG['installments.revolving'];

class Card {
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
    readonly expiryDateErrorElement: Locator;

    readonly cvcField: Locator;
    readonly cvcLabelText: Locator;
    readonly cvcErrorElement: Locator;
    readonly cvcInput: Locator;

    readonly installmentsPaymentLabel: Locator;
    readonly revolvingPaymentLabel: Locator;
    readonly installmentsDropdown: Locator;
    readonly selectorList: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-checkout__card-input') {
        this.page = page;

        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        /**
         * Card Number elements, in Checkout
         */
        this.cardNumberField = this.rootElement.locator('.adyen-checkout__field--cardNumber'); // Holder
        this.cardNumberLabelElement = this.cardNumberField.locator('.adyen-checkout__label');
        this.cardNumberErrorElement = this.cardNumberField.locator('.adyen-checkout__error-text');

        this.brandingIcon = this.rootElement.locator('.adyen-checkout__card__cardNumber__brandIcon');

        /**
         * Card Number elements, in iframe
         */
        const cardNumberIframe = this.rootElement.frameLocator(`[title="${CARD_IFRAME_TITLE}"]`);
        this.cardNumberInput = cardNumberIframe.locator(`input[aria-label="${CARD_IFRAME_LABEL}"]`);

        /**
         * Expiry Date elements, in Checkout
         */
        this.expiryDateField = this.rootElement.locator('.adyen-checkout__field--expiryDate'); // Holder
        this.expiryDateLabelText = this.expiryDateField.locator('.adyen-checkout__label__text');
        this.expiryDateErrorElement = this.expiryDateField.locator('.adyen-checkout__error-text'); // Related error element
        // Related error element

        /**
         * Expiry Date elements, in iframe
         */
        const expiryDateIframe = this.rootElement.frameLocator(`[title="${EXPIRY_DATE_IFRAME_TITLE}"]`);
        this.expiryDateInput = expiryDateIframe.locator(`input[aria-label="${EXPIRY_DATE_IFRAME_LABEL}"]`);

        /**
         * Security code elements, in Checkout
         */
        this.cvcField = this.rootElement.locator('.adyen-checkout__field--securityCode'); // Holder
        this.cvcLabelText = this.cvcField.locator('.adyen-checkout__label__text');
        this.cvcErrorElement = this.cvcField.locator('.adyen-checkout__error-text'); // Related error element

        /**
         * Security code elements, in iframe
         */
        const cvcIframe = this.rootElement.frameLocator(`[title="${CVC_IFRAME_TITLE}"]`);
        this.cvcInput = cvcIframe.locator(`input[aria-label="${CVC_IFRAME_LABEL}"]`);

        /**
         * Installments related elements
         */
        this.installmentsPaymentLabel = this.rootElement.getByText(INSTALLMENTS_PAYMENTS);
        this.revolvingPaymentLabel = this.rootElement.getByText(REVOLVING_PAYMENT);
        this.installmentsDropdown = this.rootElement.locator('.adyen-checkout__dropdown__button');
        this.selectorList = this.rootElement.getByRole('listbox');
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

    async deleteExpiryDate() {
        await this.expiryDateInput.clear();
    }

    async deleteCvc() {
        await this.cvcInput.clear();
    }

    async typeExpiryDate(expiryDate: string) {
        await this.expiryDateInput.type(expiryDate, { delay: USER_TYPE_DELAY });
    }

    async typeCvc(cvc: string) {
        await this.cvcInput.type(cvc, { delay: USER_TYPE_DELAY });
    }

    async selectListItem(who: string) {
        const listItem = this.selectorList.locator(`#listItem-${who}`);
        return listItem;
    }
}

export { Card };
