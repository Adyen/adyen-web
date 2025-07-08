import type { Page, Locator } from '@playwright/test';
import { Base } from './base';

export class Automated extends Base {
    readonly payButton: Locator;

    constructor(page: Page) {
        super(page);

        this.payButton = this.page.locator('#component-root');
    }

    async goto(url: string) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await this.isComponentVisible();
    }

    private isInternalStory() { 
        const storyUrl = this.page.url();
        // Check if is 'internal' component story
        return storyUrl && storyUrl.includes('internals-');
    }

    protected a11yComponentSelector() {
        if(this.isInternalStory()){
            return ('#storybook-root');
        }
        return '#component-root';
    }

    async isComponentVisible() {
        if(this.isInternalStory()){
            // Becasue these don't have paybutton wait 3s - it was trial and error
            // another way of doing this is welcome
            return this.page.waitForTimeout(3000);
        }
        await this.payButton.waitFor({ state: 'visible' });
    }
}
