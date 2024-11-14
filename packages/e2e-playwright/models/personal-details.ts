import { Locator, Page } from '@playwright/test';

class PersonalDetails {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    // Social security label varies per country
    private readonly socialSecurityLabel: string;

    constructor(
        public readonly page: Page,
        options?: {
            rootElementSelector?: string;
            socialSecurityLabel?: string;
        }
    ) {
        this.rootElementSelector = options.rootElementSelector || '.adyen-checkout__fieldset--personalDetails';
        this.rootElement = page.locator(this.rootElementSelector);
        this.socialSecurityLabel = options?.socialSecurityLabel || 'Social security number';
    }

    get firstNameInput() {
        return this.rootElement.getByRole('textbox', { name: /first name/i });
    }

    get lastNameInput() {
        return this.rootElement.getByRole('textbox', { name: /last name/i });
    }

    get socialSecurityNumberInput() {
        return this.rootElement.getByRole('textbox', { name: this.socialSecurityLabel });
    }
}

export { PersonalDetails };
