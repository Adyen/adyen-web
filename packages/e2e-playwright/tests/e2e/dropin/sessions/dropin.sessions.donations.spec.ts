import { test, expect } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';

const DEFAULT_DONATION_AUTO_START_DELAY_MS = 3000;

async function fillCard(card: Card) {
    await card.isComponentVisible();
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await card.typeExpiryDate(TEST_DATE_VALUE);
    await card.typeCvc(TEST_CVC_VALUE);
}

test('#1 Should succeed in making a payment and see the donation component', async ({ dropinWithSession, page }) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();
    await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);

    // Wait for default delay
    await page.waitForTimeout(DEFAULT_DONATION_AUTO_START_DELAY_MS);

    await expect(dropinWithSession.donationComponent).toBeVisible();
});

test('#2 Should succeed in making a payment, see the donation component, and make a donation', async ({ dropinWithSession, page }) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations_noDelay);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();

    await expect(dropinWithSession.donationComponent).toBeVisible();

    await dropinWithSession.getDonationAmountButtonByIndex(0).click();
    await dropinWithSession.donateButton.click();

    await expect(dropinWithSession.donationSuccess).toBeVisible();
});

test('#3 Should succeed in making a payment but not see the donation component because autoStart is false', async ({ dropinWithSession, page }) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations_autoStartFalse);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();

    await expect(dropinWithSession.donationComponent).not.toBeVisible();
});
