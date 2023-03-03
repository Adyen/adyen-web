import { Card } from './card';
import { Locator, Page } from '@playwright/test';
import { Address } from './address';

class CardWithAvs extends Card {
    readonly billingAddress: Address;

    constructor(page: Page, rootElementSelector: string = '.adyen-checkout__card-input') {
        super(page, rootElementSelector);
        this.billingAddress = new Address(page, `${rootElementSelector} .adyen-checkout__fieldset--billingAddress`);
    }
}

export { CardWithAvs };
