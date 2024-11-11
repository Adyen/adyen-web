import { Locator, Page } from '@playwright/test';

class ThreeDs2Challenge {
    readonly rootElement: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector: string = '.adyen-checkout__threeds2__challenge'
    ) {
        this.rootElement = page.locator(rootElementSelector);
    }

    get threeDSIframe() {
        return this.page.locator('iframe[name="threeDSIframe"]').contentFrame();
    }

    get passwordInput() {
        return this.threeDSIframe.getByLabel('Password');
    }

    get submitButton() {
        return this.threeDSIframe.locator('#buttonSubmit');
    }

    async fillInPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async submit() {
        await this.submitButton.click();
    }
}

export { ThreeDs2Challenge };
