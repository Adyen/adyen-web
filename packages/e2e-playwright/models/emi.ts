import { expect, Locator, Page } from '@playwright/test';
import LANG from '../../server/translations/en-US.json';
import { Base } from './base';
import { Card } from './card';
import { EMIPlanSelection } from './emiPlanSelection';
import { ThreeDs2Challenge } from './threeds2Challenge';

class EMI extends Base {
    readonly rootElement: Locator;
    readonly card: Card;
    readonly cardForm: Locator;
    readonly planSelection: EMIPlanSelection;
    readonly errorFields: Locator;
    readonly threeDs2Challenge: ThreeDs2Challenge;
    readonly payButton: Locator;
    readonly customPayButton: Locator;
    readonly spinner: Locator;
    readonly loadingAnnouncement: Locator;

    constructor(
        public readonly page: Page,
        rootElement: Locator | string = '#component-root'
    ) {
        super(page);
        this.rootElement = typeof rootElement === 'string' ? this.page.locator(rootElement) : rootElement;
        this.card = new Card(page, this.rootElement.locator('.adyen-checkout__card-input'));
        this.cardForm = this.card.rootElement.locator('.adyen-checkout__loading-input__form');
        this.planSelection = new EMIPlanSelection(page, this.rootElement);
        this.errorFields = this.rootElement.locator('.adyen-checkout__field--error');
        this.threeDs2Challenge = this.card.threeDs2Challenge;
        // The plan summary carries every figure, so the EMI button is labelled 'Pay' without an amount
        this.payButton = this.rootElement.getByRole('button', { name: LANG['payButton'], exact: true });
        // Rendered by the CardEmiWithCustomButton story, outside the component root
        this.customPayButton = this.page.getByRole('button', { name: 'Pay with EMI', exact: true });
        this.spinner = this.rootElement.locator('.adyen-checkout__spinner__wrapper');
        // The SR panel is mounted outside the component root
        this.loadingAnnouncement = this.page.getByRole('log').getByText(LANG['loading'], { exact: true });
    }

    get cardNumberField(): Locator {
        return this.card.cardNumberField;
    }

    get holderNameField(): Locator {
        return this.card.holderNameField;
    }

    /** The pay button is optional (`showPayButton`), so readiness is the embedded card form */
    async isComponentVisible() {
        await this.card.isCardFormVisible();
        // The card form fades in once its secured fields load; axe measures colour contrast on the
        // half-transparent labels if it runs mid-transition
        await expect(this.cardForm).toHaveCSS('opacity', '1');
    }

    async typeCardNumber(cardNumber: string) {
        await this.card.typeCardNumber(cardNumber);
    }

    async typeExpiryDate(expiryDate: string) {
        await this.card.typeExpiryDate(expiryDate);
    }

    async typeCvc(cvc: string) {
        await this.card.typeCvc(cvc);
    }
}

export { EMI };
