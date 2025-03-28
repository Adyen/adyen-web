import { test as base, expect } from '../../../fixtures/base-fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import BacsDirectDebit from '../../../models/bacs-direct-debit';

type Fixture = {
    bacs: BacsDirectDebit;
};

const test = base.extend<Fixture>({
    bacs: async ({ page }, use) => {
        const bacs = new BacsDirectDebit(page);
        await bacs.goto(URL_MAP.bacsDirectDebit);
        await use(bacs);
    }
});

test('should make a Bacs Direct Debit payment', async ({ bacs }) => {
    await bacs.bankAccountHolderNameInput.fill('David Archer');
    await bacs.bankAccountNumberInput.fill('40308669');
    await bacs.sortCodeInput.fill('560036');
    await bacs.emailAddressInput.fill('david.archer@adyen.com');

    await bacs.consentCheckbox.click();
    await bacs.accountConsentCheckbox.click();

    await bacs.continueButton.click();
    await bacs.pay({ name: /confirm and pay/i });

    await expect(bacs.downloadPdfButton).toBeVisible();
});
