import { Base } from './base';
import { Locator, Page } from '@playwright/test';

class Ach extends Base {
    private readonly rootElementSelector = '.adyen-checkout__ach';
    private readonly rootElement: Locator;

    constructor(page: Page) {
        super(page);
        this.rootElement = page.locator(this.rootElementSelector);
    }
}

export default Ach;
