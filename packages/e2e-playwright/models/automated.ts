import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { Base } from './base';

export class Automated extends Base {
    readonly component: Locator;

    constructor(page: Page) {
        super(page);

        this.component = this.page.locator('#component-root');
    }

    private isInternalStory(storyId: string) {
        return storyId.includes('internal-elements-');
    }

    protected a11yComponentSelector() {
        const storyUrl = this.page.url();
        if (storyUrl && storyUrl.includes('internal-elements-')) {
            return '#storybook-root';
        }
        return '#component-root';
    }

    async waitForStoryToLoad(storyId: string): Promise<void> {
        if (this.isInternalStory(storyId)) {
            // Becasue these don't have paybutton wait 3s - it was trial and error
            // another way of doing this is welcome
            await this.page.waitForTimeout(3000);
            return;
        }
        await expect(this.page.getByTestId('checkout-component-spinner')).toBeVisible();
        await expect(this.page.getByTestId('checkout-component-spinner')).toBeHidden();
        if (!storyId.includes('await')) {
            await expect(this.page.getByTestId('spinner')).toBeHidden();
        }
        if (storyId.includes('click-to-pay')) {
            await expect(this.page.locator('.adyen-checkout-ctp__card-animation')).toBeHidden();
        }
    }

    async gotoStory(storyId: string): Promise<void> {
        const storyUrl = `/iframe.html?id=${storyId}&viewMode=story`;
        await this.page.goto(storyUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await this.waitForStoryToLoad(storyId);
    }
}
