import { Base } from './base';
import { Page, Locator } from '@playwright/test';
import { SHOPPER_DATA } from '../tests/utils/constants';

class Econtext extends Base {
    readonly rootElement: Locator;
    readonly payButton: Locator;

    constructor(page: Page) {
        super(page);
        this.rootElement = page.locator('.adyen-checkout__econtext-input__field');
        this.payButton = page.getByRole('button', { name: /confirm purchase/i });
    }

    get firstNameInput() {
        return this.rootElement.getByRole('textbox', { name: /first name/i });
    }

    get lastNameInput() {
        return this.rootElement.getByRole('textbox', { name: /last name/i });
    }

    get emailInput() {
        return this.rootElement.getByRole('textbox', { name: /email address/i });
    }

    get telephoneInput() {
        return this.rootElement.getByRole('textbox', { name: /telephone number/i });
    }

    get voucherResult() {
        return this.page.locator('.adyen-checkout__voucher-result');
    }

    async isComponentVisible() {
        await this.rootElement.waitFor({ state: 'visible' });
    }

    async fillShopperData() {
        await this.firstNameInput.fill(SHOPPER_DATA.firstName);
        await this.lastNameInput.fill(SHOPPER_DATA.lastName);
        await this.emailInput.fill(SHOPPER_DATA.email);
        await this.telephoneInput.fill(SHOPPER_DATA.telephoneNumber.JP);
    }
}

export default Econtext;
