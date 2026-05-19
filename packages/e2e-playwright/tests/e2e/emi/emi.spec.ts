import { test as base, expect } from '../../../fixtures/base-fixture';
import { EMI } from '../../../models/emi';
import { URL_MAP } from '../../../fixtures/URL_MAP';

type Fixture = {
    emiPage: EMI;
};

const test = base.extend<Fixture>({
    emiPage: async ({ page }, use) => {
        await use(new EMI(page));
    }
});

test.describe('EMI - CardEmi (Native Pay Button)', () => {
    test('renders embedded card form with native pay button', async ({ emiPage }) => {
        await emiPage.goto(URL_MAP.emi);

        await expect(emiPage.cardNumberField).toBeVisible();
        await expect(emiPage.holderNameField).not.toBeVisible();

        const nativePayButton = emiPage.page.getByRole('button', { name: /pay/i });
        await expect(nativePayButton).toBeVisible();

        const customButton = emiPage.page.locator('#custom-pay-button');
        await expect(customButton).not.toBeVisible();
    });
});

test.describe('EMI - CardEmiWithCustomButton (Custom Pay Button)', () => {
    test('renders card form with external custom button and triggers validation on click', async ({ emiPage }) => {
        await emiPage.goto(URL_MAP.emiWithCustomButton);

        await expect(emiPage.cardNumberField).toBeVisible();

        const customButton = emiPage.page.locator('#custom-pay-button');

        await expect(customButton).toBeVisible();

        // Native pay button from the EMI wrapper should not be rendered (showPayButton: false)
        // The only button with "pay" text should be the custom one
        const payButtons = emiPage.page.getByRole('button', { name: /pay/i });
        await expect(payButtons).toHaveCount(1);

        await customButton.click();

        // Clicking submit on empty card fields triggers validation (fields show error state)
        await expect(emiPage.errorFields.first()).toBeVisible();
    });
});
