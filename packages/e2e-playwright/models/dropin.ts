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

class Dropin {
    readonly page: Page;

    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly pmList: Locator;
    readonly creditCard: Locator;
    readonly brandsHolder: Locator;
    // readonly cardNumberLabelElement: Locator;
    // readonly cardNumberErrorElement: Locator;
    // readonly cardNumberInput: Locator;
    // readonly brandingIcon: Locator;
    //
    // readonly expiryDateField: Locator;
    // readonly expiryDateLabelText: Locator;
    // readonly expiryDateInput: Locator;
    // readonly expiryDateErrorElement: Locator;
    //
    // readonly cvcField: Locator;
    // readonly cvcLabelText: Locator;
    // readonly cvcErrorElement: Locator;
    // readonly cvcInput: Locator;
    //
    // readonly installmentsPaymentLabel: Locator;
    // readonly revolvingPaymentLabel: Locator;
    // readonly installmentsDropdown: Locator;
    // readonly selectorList: Locator;

    constructor(page: Page, rootElementSelector = '.adyen-checkout__dropin') {
        this.page = page;

        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.pmList = this.rootElement.locator('.adyen-checkout__payment-methods-list');
    }

    async isComponentVisible() {
        await this.pmList.waitFor({ state: 'visible' });
    }

    getPaymentMethodItem(pmName: string) {
        return this.pmList.locator(`.adyen-checkout__payment-method:has-text("${pmName}")`);
    }

    // async typeCardNumber(cardNumber: string) {
    //     await this.cardNumberInput.type(cardNumber, { delay: USER_TYPE_DELAY });
    // }
    //
    // async deleteCardNumber() {
    //     await this.cardNumberInput.clear();
    // }
    //
    // async deleteExpiryDate() {
    //     await this.expiryDateInput.clear();
    // }
    //
    // async deleteCvc() {
    //     await this.cvcInput.clear();
    // }
    //
    // async typeExpiryDate(expiryDate: string) {
    //     await this.expiryDateInput.type(expiryDate, { delay: USER_TYPE_DELAY });
    // }
    //
    // async typeCvc(cvc: string) {
    //     await this.cvcInput.type(cvc, { delay: USER_TYPE_DELAY });
    // }
    //
    // async selectListItem(who: string) {
    //     const listItem = this.selectorList.locator(`#listItem-${who}`);
    //     return listItem;
    // }
}

export { Dropin };
