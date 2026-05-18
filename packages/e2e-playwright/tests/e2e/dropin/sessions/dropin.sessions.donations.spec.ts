import { test, expect } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';

import { donationCampaignsMock, donationCampaignsErrorMock, donationsMock } from '../../../../mocks/sessions/donations/donations.mock';
import { donationCampaignsFixedAmountsMockData, donationSuccessMockData } from '../../../../mocks/sessions/donations/donations.data';

const DEFAULT_DONATION_AUTO_START_DELAY_MS = 3000;

async function fillCard(card: Card) {
    await card.isComponentVisible();
    await card.typeCardNumber(REGULAR_TEST_CARD);
    await card.typeExpiryDate(TEST_DATE_VALUE);
    await card.typeCvc(TEST_CVC_VALUE);
}

test('#1 Should succeed in making a payment and see the donation component', async ({ dropinWithSession, page }) => {
    // Set up mock BEFORE navigating
    await donationCampaignsMock(page, donationCampaignsFixedAmountsMockData);

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

test('#2 Should succeed in making a payment, see the donation component, and make a (fixedAmount) donation', async ({ dropinWithSession, page }) => {
    // Set up mocks BEFORE navigating
    await donationCampaignsMock(page, donationCampaignsFixedAmountsMockData);
    await donationsMock(page, donationSuccessMockData);

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

test('#3 Should succeed in making a payment but not see the donation component because autoMount is false', async ({ dropinWithSession, page }) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations_autoMountFalse);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();

    await expect(dropinWithSession.donationComponent).not.toBeVisible();
});

test('#4  Should succeed in making a payment, and see the donation component reparented into another container ', async ({
    dropinWithSession,
    page
}) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations_reparented);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();

    await expect(dropinWithSession.donationDialog).toBeVisible(); // parent
    await expect(dropinWithSession.donationComponentReparented).toBeVisible();
});

test('#5 Should succeed in making a payment, and see the donation component remain in the default container because autoMount is true', async ({
    dropinWithSession,
    page
}) => {
    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations_reparented_autoMountTrue);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();

    await expect(dropinWithSession.donationDialog).toBeVisible(); // parent is still created by the story
    await expect(dropinWithSession.donationComponentReparented).not.toBeVisible(); // but donation comp is *not* placed in the parent

    await expect(dropinWithSession.donationComponent).toBeVisible();
});

test('#6 Should succeed in making a payment but not show donation component when /donationCampaigns returns 500 error', async ({
    dropinWithSession,
    page
}) => {
    // Set up error mock BEFORE navigating
    await donationCampaignsErrorMock(page, 500);

    await dropinWithSession.goto(URL_MAP.dropinWithSession_donations_noDelay);
    const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

    const card = new Card(page, paymentMethodDetailsLocator);

    await fillCard(card);

    await dropinWithSession.pay();
    await expect(dropinWithSession.paymentResult).toContainText(PAYMENT_RESULT.success);

    await page.waitForTimeout(100); // allow small delay for the call to /donationCampaigns

    // Donation component should not be visible due to the error
    await expect(dropinWithSession.donationComponent).not.toBeVisible();
});
