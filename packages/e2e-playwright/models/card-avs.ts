import { Card } from './card';
import { Page } from '@playwright/test';
import { Address } from './address';

class CardWithAvs extends Card {
    readonly billingAddress: Address;

    constructor(page: Page, rootElementSelector: string) {
        super(page, rootElementSelector);
        this.billingAddress = new Address(page, `${rootElementSelector} .adyen-checkout__fieldset--billingAddress`);
    }

    async fillInPostCode(postCode: string) {
        await this.billingAddress.fillInPostCode(postCode);
    }
}

export { CardWithAvs };
