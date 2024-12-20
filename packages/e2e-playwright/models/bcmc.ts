import { Card } from './card';

class BCMC extends Card {
    get brands() {
        return this.cardNumberField.locator('.adyen-checkout__card__cardNumber__brandIcon').all();
    }

    async waitForVisibleBrands(expectedNumber = 2) {
        return await this.page.waitForFunction(
            expectedLength => [...document.querySelectorAll('.adyen-checkout__card__cardNumber__brandIcon')].length === expectedLength,
            expectedNumber
        );
    }

    async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryDateInput.waitFor({ state: 'visible' });
    }
    async selectBrand(
        text: string | RegExp,
        options?: {
            exact?: boolean;
        }
    ) {
        await this.cardNumberField.getByAltText(text, options).click();
    }
}

export { BCMC };
