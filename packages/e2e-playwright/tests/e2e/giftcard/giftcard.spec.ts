import { test, expect } from '../../../fixtures/card.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { Giftcard } from '../../../models/giftcard';
import { Card } from '../../../models/card';

test.describe('Giftcard - Payment flow', () => {
    test('#1 Should fill in gift card fields and complete the payment', async ({ page }) => {
        const giftcard = new Giftcard(page);
        await giftcard.gotoWithAmount(undefined, { amount: '4000' });

        await giftcard.fillGiftcardNumber('6036280000000000000');
        await giftcard.fillPin('123');
        await giftcard.redeem();

        await giftcard.clickPayButton();

        await expect(giftcard.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });

    test('#2 Should fill in gift card and complete payment with card', async ({ page }) => {
        const giftcard = new Giftcard(page);
        await giftcard.gotoWithAmount(undefined, { amount: '10000' });

        await giftcard.fillGiftcardNumber('6036280000000000000');
        await giftcard.fillPin('123');
        await giftcard.redeem();

        const card = new Card(page);
        await card.isComponentVisible();

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeCvc(TEST_CVC_VALUE);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.pay();

        await expect(giftcard.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });

    test('#3 Should fill in gift card and complete payment with other gift card', async ({ page }) => {
        const giftcard = new Giftcard(page);
        await giftcard.gotoWithAmount(URL_MAP.giftcard_with_giftcard, { amount: '7500' });

        await giftcard.fillGiftcardNumber('6036280000000000000');
        await giftcard.fillPin('123');
        await giftcard.redeem();

        await giftcard.hasCorrectRemainingAmount('2500');

        await giftcard.fillGiftcardNumber('6036280000000000000');
        await giftcard.fillPin('123');
        await giftcard.redeem();

        await giftcard.clickPayButton();

        await expect(giftcard.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});
