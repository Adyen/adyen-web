import type { Page, Locator } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';
import LANG from '../../server/translations/en-US.json';
import { Base } from './base';
import { URL_MAP } from '../fixtures/URL_MAP';
import { ThreeDs2Challenge } from './threeds2Challenge';

const CARD_IFRAME_TITLE = LANG['creditCard.encryptedCardNumber.aria.iframeTitle'];
const EXPIRY_DATE_IFRAME_TITLE = LANG['creditCard.encryptedExpiryDate.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['creditCard.cardNumber.label'];
const EXPIRY_DATE_IFRAME_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];

const INSTALLMENTS_PAYMENTS = LANG['installments.installments'];
const REVOLVING_PAYMENT = LANG['installments.revolving'];

class Card extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly cardNumberField: Locator;
    readonly cardNumberLabelElement: Locator;
    readonly cardNumberErrorElement: Locator;
    readonly cardNumberInput: Locator;
    readonly brandingIcon: Locator;

    readonly expiryDateField: Locator;
    readonly expiryDateLabelElement: Locator;
    readonly expiryDateLabelText: Locator;
    readonly expiryDateContextualElement: Locator;
    readonly expiryDateInput: Locator;
    readonly expiryDateIframeContextualElement: Locator;
    readonly expiryDateErrorElement: Locator;

    readonly cvcField: Locator;
    readonly cvcLabelElement: Locator;
    readonly cvcLabelText: Locator;
    readonly cvcErrorElement: Locator;
    readonly cvcContextualElement: Locator;
    readonly cvcInput: Locator;
    readonly cvcIframeContextualElement: Locator;

    readonly holderNameField: Locator;
    readonly holderNameInput: Locator;

    readonly installmentsPaymentLabel: Locator;
    readonly revolvingPaymentLabel: Locator;
    readonly installmentsDropdown: Locator;
    readonly selectorList: Locator;
    readonly threeDs2Challenge: ThreeDs2Challenge;

    constructor(
        public readonly page: Page,
        rootElementSelector = '.adyen-checkout__card-input'
    ) {
        super(page);
        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        /**
         * Card Number elements, in Checkout
         */
        this.cardNumberField = this.rootElement.locator('.adyen-checkout__field--cardNumber'); // Holder
        this.cardNumberLabelElement = this.cardNumberField.locator('.adyen-checkout__label');
        this.cardNumberErrorElement = this.cardNumberField.locator('.adyen-checkout-contextual-text--error');

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
        this.expiryDateLabelElement = this.expiryDateField.locator('.adyen-checkout__label');
        this.expiryDateLabelText = this.expiryDateField.locator('.adyen-checkout__label__text');
        this.expiryDateContextualElement = this.expiryDateField.locator('.adyen-checkout-contextual-text'); // Related contextual element
        this.expiryDateErrorElement = this.expiryDateField.locator('.adyen-checkout-contextual-text--error'); // Related error element

        /**
         * Expiry Date elements, in iframe
         */
        const expiryDateIframe = this.rootElement.frameLocator(`[title="${EXPIRY_DATE_IFRAME_TITLE}"]`);
        this.expiryDateInput = expiryDateIframe.locator(`input[aria-label="${EXPIRY_DATE_IFRAME_LABEL}"]`);
        this.expiryDateIframeContextualElement = expiryDateIframe.locator('.aria-context');

        /**
         * Security code elements, in Checkout
         */
        this.cvcField = this.rootElement.locator('.adyen-checkout__field--securityCode'); // Holder
        this.cvcLabelElement = this.cvcField.locator('.adyen-checkout__label');
        this.cvcLabelText = this.cvcField.locator('.adyen-checkout__label__text');
        this.cvcContextualElement = this.cvcField.locator('.adyen-checkout-contextual-text'); // Related contextual element
        this.cvcErrorElement = this.cvcField.locator('.adyen-checkout-contextual-text--error'); // Related error element

        /**
         * Security code elements, in iframe
         */
        const cvcIframe = this.rootElement.frameLocator(`[title="${CVC_IFRAME_TITLE}"]`);
        this.cvcInput = cvcIframe.locator(`input[aria-label="${CVC_IFRAME_LABEL}"]`);
        this.cvcIframeContextualElement = cvcIframe.locator('.aria-context');

        /**
         * HolderName elements, in Checkout
         */
        this.holderNameField = this.rootElement.locator('.adyen-checkout__card__holderName'); // Holder
        this.holderNameInput = this.holderNameField.getByRole('textbox', { name: /name on card/i });

        /**
         * Installments related elements
         */
        this.installmentsPaymentLabel = this.rootElement.getByText(INSTALLMENTS_PAYMENTS);
        this.revolvingPaymentLabel = this.rootElement.getByText(REVOLVING_PAYMENT);
        this.installmentsDropdown = this.rootElement.locator('.adyen-checkout__dropdown__button');
        this.selectorList = this.rootElement.getByRole('listbox');

        this.threeDs2Challenge = new ThreeDs2Challenge(page);
    }

    get availableBrands() {
        return this.rootElement.locator('.adyen-checkout__card__brands').getByRole('img').all();
    }

    async goto(url: string = URL_MAP.card) {
        await this.page.goto(url);
        await this.isComponentVisible();
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryDateInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async fillCardNumber(cardNumber: string) {
        // reason: https://playwright.dev/docs/api/class-locator#locator-type
        // use-case when we don't need to inspect keyboard events
        await this.cardNumberInput.fill(cardNumber);
    }

    async typeCardNumber(cardNumber: string) {
        await this.cardNumberInput.pressSequentially(cardNumber, { delay: USER_TYPE_DELAY });
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

    async fillExpiryDate(expiryDate: string) {
        // reason: https://playwright.dev/docs/api/class-locator#locator-type
        // use-case when we don't need to inspect keyboard events
        await this.expiryDateInput.fill(expiryDate);
    }

    async typeExpiryDate(expiryDate: string) {
        await this.expiryDateInput.pressSequentially(expiryDate, { delay: USER_TYPE_DELAY });
    }

    async fillCvc(cvc: string) {
        // reason: https://playwright.dev/docs/api/class-locator#locator-type
        // use-case when we don't need to inspect keyboard events
        await this.cvcInput.fill(cvc);
    }

    async typeCvc(cvc: string) {
        await this.cvcInput.pressSequentially(cvc, { delay: USER_TYPE_DELAY });
    }

    async selectListItem(who: string) {
        return this.selectorList.locator(`#listItem-${who}`);
    }
}

export { Card };
