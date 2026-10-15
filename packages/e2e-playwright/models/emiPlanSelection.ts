import { expect, Locator, Page } from '@playwright/test';

/** Plan selection and plan summary UI of the EMI component, reached through `EMI.planSelection`. */
class EMIPlanSelection {
    readonly providerSelect: Locator;
    readonly planSelect: Locator;
    readonly planGroup: Locator;
    readonly planSummaryGroup: Locator;
    readonly summaryLabels: Locator;
    readonly summaryValues: Locator;

    constructor(
        public readonly page: Page,
        public readonly rootElement: Locator
    ) {
        // Scoped to the combobox role: the sections around the selects are named 'EMI plan' and
        // 'Plan summary', which a plain `getByLabel('Plan')` also matches
        this.providerSelect = this.rootElement.getByRole('combobox', { name: 'Provider' });
        this.planSelect = this.rootElement.getByRole('combobox', { name: 'Plan' });
        this.planGroup = this.rootElement.getByRole('group', { name: 'EMI plan' });
        this.planSummaryGroup = this.rootElement.getByRole('group', { name: 'Plan summary' });
        this.summaryLabels = this.planSummaryGroup.getByRole('term');
        this.summaryValues = this.planSummaryGroup.getByRole('definition');
    }

    summaryValue(label: string | RegExp): Locator {
        return this.planSummaryGroup
            .locator('div')
            .filter({ has: this.page.getByRole('term').filter({ hasText: label }) })
            .getByRole('definition');
    }

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

    // The option list is linked to its combobox through `aria-controls`, so a select only ever
    // resolves its own options even while the other list is still in the DOM
    private async openList(select: Locator): Promise<Locator> {
        await select.click();
        // Retries until the open select links its list, so a missing link fails here instead of querying [id="null"]
        await expect(select).toHaveAttribute('aria-controls', /.+/);
        const listId = await select.getAttribute('aria-controls');
        return this.rootElement.locator(`[id="${listId}"]`).getByRole('option');
    }
}

export { EMIPlanSelection };
