import { Card } from './card';
import { type Locator, Page } from '@playwright/test';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

class CardWithKCP extends Card {
    constructor(page: Page) {
        super(page);
    }

    get cardNumberKoreanBrand() {
        return this.rootElement.getByAltText('korean_local_card');
    }

    get taxNumberInput() {
        return this.rootElement.getByRole('textbox', { name: /Cardholder birthdate/i });
    }

    get taxNumberErrorLocator() {
        return this.rootElement.locator('.adyen-checkout__field--kcp-taxNumber .adyen-checkout-contextual-text--error');
    }

    get passwordInput() {
        const passwordIframe = this.rootElement.frameLocator('[title="Iframe for password"]');
        return passwordIframe.locator('input[aria-label="First 2 digits of card password"]');
    }

    get passwordErrorLocator() {
        return this.rootElement.locator('.adyen-checkout__field--koreanAuthentication-encryptedPassword .adyen-checkout-contextual-text--error');
    }

    async typeTaxNumber(taxNumber: string) {
        return this.taxNumberInput.pressSequentially(taxNumber, { delay: USER_TYPE_DELAY });
    }

    async typePassword(password: string) {
        return this.passwordInput.pressSequentially(password, { delay: USER_TYPE_DELAY });
    }
}

export { CardWithKCP };
