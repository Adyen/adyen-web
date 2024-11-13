import { Base } from './base';
import { Address } from './address';
import { Page } from '@playwright/test';
import { PersonalDetails } from './personal-details';

class Boleto extends Base {
    readonly billingAddress: Address;
    readonly personalDetails: PersonalDetails;

    constructor(page: Page) {
        super(page);
        this.personalDetails = new PersonalDetails(page, { socialSecurityLabel: 'CPF/CNPJ' });
        this.billingAddress = new Address(page);
    }

    get barcodeLocator() {
        return this.page.locator('.adyen-checkout__voucher-result__code > img');
    }
}

export default Boleto;
