import { Locator, Page } from '@playwright/test';
import { Base } from './base';
// Non session
class Dropin extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly pmList: Locator;
    readonly creditCard: Locator;
    readonly saveDetailsButton: Locator;
    readonly payButton: Locator;

    protected _paymentMethods: Array<{ name: string; type: string }>;

    constructor(
        public readonly page: Page,
        rootElementSelector = '.adyen-checkout__dropin'
    ) {
        super(page);
        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.pmList = this.rootElement.locator('.adyen-checkout__payment-methods-list').last();
        this.payButton = this.page.getByRole('button', { name: /Pay/i });
        this.saveDetailsButton = this.page.getByRole('button', { name: /Save details/i });
    }

    async isComponentVisible() {
        await this.pmList.waitFor({ state: 'visible' });
    }

    async goto(url?: string) {
        await this.page.goto(url);
        const response = await this.page.waitForResponse(response => response.url().includes('paymentMethods') && response.status() === 200);
        this._paymentMethods = (await response.json()).paymentMethods.map(({ name, type }: { name: string; type: string }) => ({ name, type }));
        await this.isComponentVisible();
    }

    getPaymentMethodItemByType(pmType: string) {
        const pmLabel = this.paymentMethods.find((pm: { type: string }) => pm.type === pmType).name;
        return this.pmList.locator(`.adyen-checkout__payment-method:has-text("${pmLabel}")`);
    }

    get paymentMethods() {
        return this._paymentMethods;
    }

    async saveDetails() {
        await this.saveDetailsButton.click();
    }
}

export { Dropin };
