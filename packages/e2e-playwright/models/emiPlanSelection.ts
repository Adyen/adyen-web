import { Locator, Page } from '@playwright/test';
import { Base } from './base';

/**
 * Plan selection and plan summary UI of the EMI component. Kept out of the EMI model so the
 * locators stay grouped with the section they belong to, and reached through `EMI.planSelection`.
 */
class EMIPlanSelection extends Base {
    readonly providerSelect: Locator;
    readonly planSelect: Locator;
    readonly discountBanner: Locator;
    readonly summaryLabels: Locator;
    readonly summaryValues: Locator;

    constructor(public readonly page: Page) {
        super(page);
        // Scoped to the combobox role: the sections around the selects are named 'EMI plan' and
        // 'Plan summary', which a plain `getByLabel('Plan')` also matches
        this.providerSelect = this.page.getByRole('combobox', { name: 'Provider' });
        this.planSelect = this.page.getByRole('combobox', { name: 'Plan' });
        this.discountBanner = this.page.getByText(/discount offer applied for using/i);
        this.summaryLabels = this.page.getByRole('term');
        this.summaryValues = this.page.getByRole('definition');
    }

    /**
     * A Select only exposes its options while the list is open, so the list is opened first and
     * scoped to the select that owns it through `aria-controls`.
     */
    async openProviderList(): Promise<Locator> {
        return this.openList(this.providerSelect);
    }

    async openPlanList(): Promise<Locator> {
        return this.openList(this.planSelect);
    }

    async selectProvider(name: string | RegExp) {
        const options = await this.openProviderList();
        await options.filter({ hasText: name }).click();
    }

    async selectPlan(name: string | RegExp) {
        const options = await this.openPlanList();
        await options.filter({ hasText: name }).click();
    }

    private async openList(select: Locator): Promise<Locator> {
        await select.click();
        const listId = await select.getAttribute('aria-controls');
        return this.page.locator(`#${listId}`).getByRole('option');
    }
}

export { EMIPlanSelection };
