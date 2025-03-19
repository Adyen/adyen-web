import { test as base, expect } from '../../../fixtures/base-fixture';
import Boleto from '../../../models/boleto';
import { URL_MAP } from '../../../fixtures/URL_MAP';

type Fixture = {
    boleto: Boleto;
};

const test = base.extend<Fixture>({
    boleto: async ({ page }, use) => {
        const boleto = new Boleto(page);
        await boleto.goto(URL_MAP.boleto);
        await use(boleto);
    }
});

test('should make a Boleto payment', async ({ boleto, page }) => {
    await boleto.personalDetails.firstNameInput.fill('Jose');
    await boleto.personalDetails.lastNameInput.fill('Fernandez');
    await boleto.personalDetails.socialSecurityNumberInput.fill('56861752509');

    await boleto.billingAddress.streetInput.fill('Main St');
    await boleto.billingAddress.houseNumberInput.fill('1');
    await boleto.billingAddress.postalCodeInput.fill('13010111');
    await boleto.billingAddress.cityInput.fill('Capital');
    await boleto.billingAddress.selectState({ name: 'São Paulo' });

    await boleto.pay({ name: 'Generate Boleto' });

    await expect(boleto.barcodeLocator).toBeVisible();
});
