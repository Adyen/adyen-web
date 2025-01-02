import { Card } from './card';
import LANG from '../../server/translations/en-US.json';

const CVC_IFRAME_TITLE = LANG['creditCard.encryptedSecurityCode.aria.iframeTitle'];
const CVC_IFRAME_LABEL = LANG['creditCard.securityCode.label'];

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

    /**
     * When in the context of the Dropin, if storedPMs are not hidden - the cvcInput locator will find 2 CVC inputs
     * - the hidden, storedPM, one, and the one in the BCMC comp
     */
    get getCVCInputInDropin() {
        const rootEl = this.rootElement.locator('.adyen-checkout__payment-method--bcmc');
        const cvcIframe = rootEl.frameLocator(`[title="${CVC_IFRAME_TITLE}"]`);
        return cvcIframe.locator(`input[aria-label="${CVC_IFRAME_LABEL}"]`);
    }
}

export { BCMC };

// adyen-checkout__payment-method--bcmc
