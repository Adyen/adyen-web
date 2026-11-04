import { Locator, Page } from '@playwright/test';
import { Base } from './base';

class BECS extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;
    readonly holderNameInput: Locator;
    readonly bsbInput: Locator;
    readonly accountNumberInput: Locator;
    readonly emailInput: Locator;
    readonly mandateText: Locator;
    declare readonly payButton: Locator;
    readonly erroredFields: Locator;
    readonly errorMessages: Locator;
    readonly successHeading: Locator;
    readonly authorisedRequestLink: Locator;
    readonly serviceAgreementLink: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector = '#component-root'
    ) {
        super(page);
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;
        this.holderNameInput = this.rootElement.getByRole('textbox', { name: /account holder name/i });
        this.bsbInput = this.rootElement.getByRole('textbox', { name: /bsb/i });
        this.accountNumberInput = this.rootElement.getByRole('textbox', { name: /account number/i });
        this.emailInput = this.rootElement.getByRole('textbox', { name: /email address/i });
        this.mandateText = this.rootElement.getByText(/request and authorise Adyen Australia Pty Ltd/i);
        this.payButton = this.rootElement.getByRole('button', { name: /confirm/i });
        this.erroredFields = this.rootElement.locator('.adyen-checkout__field--error');
        this.errorMessages = this.rootElement.locator('.adyen-checkout-contextual-text--error');
        this.successHeading = this.rootElement.getByRole('heading', { name: /success/i });
        this.authorisedRequestLink = this.rootElement.getByRole('link', { name: /download authorised direct debit request/i });
        this.serviceAgreementLink = this.rootElement.getByRole('link', { name: /read direct debit request service agreement/i });
    }

    async isComponentVisible() {
        await this.rootElement.waitFor({ state: 'visible' });
    }
}

export { BECS };
