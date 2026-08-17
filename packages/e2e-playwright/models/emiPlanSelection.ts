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
        this.providerSelect = this.page.getByLabel('Provider');
        this.planSelect = this.page.getByLabel('Plan');
        this.discountBanner = this.page.getByText(/discount offer applied for using/i);
        this.summaryLabels = this.page.getByRole('term');
        this.summaryValues = this.page.getByRole('definition');
    }

    /**
     * The list of a Select stays in the DOM when collapsed, so options are scoped to the listbox of
     * the select they belong to rather than queried globally.
     */
    get providerOptions(): Locator {
        return this.page.getByRole('listbox').first().getByRole('option');
    }

    get planOptions(): Locator {
        return this.page.getByRole('listbox').last().getByRole('option');
    }

    async selectProvider(name: string | RegExp) {
        await this.providerSelect.click();
        await this.providerOptions.filter({ hasText: name }).click();
    }

    async selectPlan(name: string | RegExp) {
        await this.planSelect.click();
        await this.planOptions.filter({ hasText: name }).click();
    }
}

export { EMIPlanSelection };
