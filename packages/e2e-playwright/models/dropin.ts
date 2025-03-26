import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class PaymentMethodHeader {
    readonly rootElement: Locator;

    constructor(rootLocator: Locator) {
        this.rootElement = rootLocator;
    }

    async getVisibleCardBrands(): Promise<Locator[]> {
        return await this.rootElement.locator('.adyen-checkout__payment-method__brands').getByRole('img').all();
    }

    async getRemainingBrandsNumberLocator(): Promise<Locator> {
        return this.rootElement.locator('.adyen-checkout__payment-method__brand-number');
    }

    async getRemainingBrandsNumberText(): Promise<string> {
        const locator = await this.getRemainingBrandsNumberLocator();
        return await locator.textContent();
    }
}

// Non session
class Dropin extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly pmList: Locator;
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
        this.payButton = this.pmList.getByRole('button', { name: /Pay/i });
        this.saveDetailsButton = this.page.getByRole('button', { name: /Save details/i });
    }

    async isComponentVisible() {
        await this.pmList.waitFor({ state: 'visible' });
    }

    async goto(url?: string) {
        await this.page.goto(url);
        // Wait for payment methods from the payments call
        const responsePromise = this.page.waitForResponse(response => response.url().includes('paymentMethods') && response.status() === 200);
        const response = await responsePromise;
        this._paymentMethods = (await response.json()).paymentMethods.map(({ name, type }: { name: string; type: string }) => ({ name, type }));
        await this.isComponentVisible();
    }

    /**
     * Returns PaymentMethodHeader which manages the Drop-in payment method list item UI
     */
    getPaymentMethodHeader(paymentMethodLabel: string): PaymentMethodHeader {
        const locator = this.rootElement
            .locator('.adyen-checkout__payment-method')
            .getByRole('radio', { name: paymentMethodLabel })
            .locator('..')
            .locator('..');

        return new PaymentMethodHeader(locator);
    }

    /**
     * Clicks in the payment method item header, and returns the Locator of its content
     *
     * @param pmType tx variant
     */
    async selectNonStoredPaymentMethod(pmType: string): Promise<{ paymentMethodDetailsLocator: Locator }> {
        const pmLabel = this.paymentMethods.find((pm: { type: string }) => pm.type === pmType).name;

        const paymentMethodHeaderLocator = this.page
            .locator('.adyen-checkout__payment-methods-list--otherPayments')
            .getByRole('radio', { name: pmLabel });

        await paymentMethodHeaderLocator.check();

        const paymentMethodDetailsLocator = paymentMethodHeaderLocator
            .locator('..')
            .locator('..')
            .locator(':scope > .adyen-checkout-pm-details-wrapper');

        return { paymentMethodDetailsLocator };
    }

    // Stored payment methods
    async selectFirstStoredPaymentMethod(pmType: string, lastFour?: string): Promise<{ paymentMethodDetailsLocator: Locator }> {
        const pmLabel = this.paymentMethods.find((pm: { type: string }) => pm.type === pmType)?.name;

        const paymentMethodHeaderLocator = await this.page
            .locator('.adyen-checkout__payment-method')
            .filter({ has: this.page.getByRole('img', { name: pmLabel ?? pmType }) }) // filter the payment methods which have the correct logo
            .getByRole('radio', { name: lastFour, exact: false })
            .first();

        await paymentMethodHeaderLocator.click();

        const paymentMethodDetailsLocator = paymentMethodHeaderLocator
            .locator('..')
            .locator('..')
            .locator(':scope > .adyen-checkout-pm-details-wrapper');

        return { paymentMethodDetailsLocator };
    }

    async saveDetails() {
        await this.saveDetailsButton.click();
    }

    get paymentMethods() {
        return this._paymentMethods;
    }

    get paymentResult() {
        return this.page.locator('.adyen-checkout__status');
    }
}

export { Dropin };
