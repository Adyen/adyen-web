import { test as base, expect } from '../../../fixtures/base-fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { BECS } from '../../../models/becs';
import { BECS_DATA } from '../../utils/constants';

type Fixture = {
    becs: BECS;
};

const test = base.extend<Fixture>({
    becs: async ({ page }, use) => {
        await use(new BECS(page));
    }
});

test.describe('BECS Direct Debit', () => {
    test('should render the form with the mandate text', async ({ becs }) => {
        await becs.goto(URL_MAP.becs);
        await expect(becs.holderNameInput).toBeVisible();
        await expect(becs.bsbInput).toBeVisible();
        await expect(becs.accountNumberInput).toBeVisible();
        await expect(becs.emailInput).toBeVisible();
        await expect(becs.mandateText).toBeVisible();
        await expect(becs.payButton).toBeVisible();
    });

    test('should format the BSB as it is typed', async ({ becs }) => {
        await becs.goto(URL_MAP.becs);
        await becs.bsbInput.pressSequentially(BECS_DATA.bsb);
        await expect(becs.bsbInput).toHaveValue(BECS_DATA.formattedBsb);
    });

    test('should show validation errors when confirming an empty form', async ({ becs }) => {
        await becs.goto(URL_MAP.becs);
        await becs.pay();
        await expect(becs.erroredFields).toHaveCount(4);
        await expect(becs.errorMessages).toHaveText([
            'Enter an account holder name',
            'Enter a valid 6-digit BSB',
            'Enter a valid account number',
            'Enter the email address'
        ]);
    });

    test('should render the result screen with both agreement links', async ({ becs }) => {
        await becs.goto(URL_MAP.becsSuccess);
        await expect(becs.successHeading).toBeVisible();
        await expect(becs.authorisedRequestLink).toHaveAttribute('href', BECS_DATA.authorisedRequestUrl);
        await expect(becs.serviceAgreementLink).toHaveAttribute('href', BECS_DATA.serviceAgreementUrl);
    });
});
