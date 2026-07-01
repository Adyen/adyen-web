import { test, expect } from '../../../../fixtures/dropin.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';

test.describe('Dropin - Review Page', () => {
    test('#1 Should succeed in making a payment via the review page flow', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinReviewPage);

        const { paymentMethodDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');

        const card = new Card(page, paymentMethodDetailsLocator);
        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        await page.getByRole('button', { name: /Continue/i }).click();

        await expect(page.getByTestId('review-page')).toBeVisible();

        await page.getByTestId('review-confirm').click();

        await expect(page.getByTestId('result-message')).toContainText(PAYMENT_RESULT.authorised);
    });
});
