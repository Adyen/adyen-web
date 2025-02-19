import type { Page, Locator } from '@playwright/test';
import LANG from '../../server/translations/en-US.json';
import { Base } from './base';
import { URL_MAP } from '../fixtures/URL_MAP';

const CARD_IFRAME_TITLE = LANG['giftcard.encryptedCardNumber.aria.iframeTitle'];
const CVC_IFRAME_TITLE = LANG['giftcard.encryptedSecurityCode.aria.iframeTitle'];

const CARD_IFRAME_LABEL = LANG['giftcard.cardNumber.label'];
const CVC_IFRAME_LABEL = LANG['giftcard.securityCode.label'];

export class Giftcard extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly cardNumberInput: Locator;

    readonly cvcInput: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector = '.adyen-checkout__giftcard'
    ) {
        super(page);
        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        const cardNumberIframe = this.rootElement.frameLocator(`[title="${CARD_IFRAME_TITLE}"]`);
        this.cardNumberInput = cardNumberIframe.locator(`input[aria-label="${CARD_IFRAME_LABEL}"]`);

        const cvcIframe = this.rootElement.frameLocator(`[title="${CVC_IFRAME_TITLE}"]`);
        this.cvcInput = cvcIframe.locator(`input[aria-label="${CVC_IFRAME_LABEL}"]`);
    }

    async goto(url: string = URL_MAP.giftcard_with_card) {
        await this.page.goto(url);
        await this.isComponentVisible();
    }

    async gotoWithAmount(url: string = URL_MAP.giftcard_with_card, { amount }: { amount: string }) {
        await this.page.goto(url + `&args=amount:${amount}`);
        await this.isComponentVisible();
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.cvcInput.waitFor({ state: 'visible' });
    }

    async hasCorrectRemainingAmount(amount: string) {
        return this.page.getByText(`Remaining amount: ${amount}`).waitFor();
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
    async fillGiftcardNumber(cardNumber: string) {
        await this.cardNumberInput.fill(cardNumber);
    }

    async fillPin(cvc: string) {
        await this.cvcInput.fill(cvc);
    }

    async redeem() {
        await super.pay({ name: 'Redeem' });
    }

    async clickPayButton() {
        await this.page.getByRole('button', { name: 'Pay' }).click();
    }
}
