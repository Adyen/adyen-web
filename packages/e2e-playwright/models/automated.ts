import type { Page, Locator } from '@playwright/test';
import { Base } from './base';

export class Automated extends Base {
    readonly component: Locator;

    constructor(page: Page) {
        super(page);

        this.component = this.page.locator('#component-root');
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
        await this.component.waitFor({ state: 'visible' });
    }
}
