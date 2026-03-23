import dotenv from 'dotenv';
import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';
import { GiftCard } from '../../../../models/giftcard';
import { toHaveScreenshot } from '../../../utils/assertions';
import { TAGS } from '../../../utils/constants';

dotenv.config();
const apiVersion = Number(process.env.API_VERSION.substring(1));

test.describe('Dropin - Sessions - GiftCards', () => {
    test(
        'Should show the correct updated amount after redeeming a gift card',
        { tag: [TAGS.SCREENSHOT] },
        async ({ dropinWithSession, page, browserName }) => {
            await dropinWithSession.goto(URL_MAP.dropinWithSession);

            const { paymentMethodDetailsLocator: cardBeforeGiftCardRedeemLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');
            const cardBeforeGiftCardRedeem = new Card(page, cardBeforeGiftCardRedeemLocator);
            await cardBeforeGiftCardRedeem.isComponentVisible();
            await expect(cardBeforeGiftCardRedeem.payButton).toHaveText('Pay $259.00');

            await toHaveScreenshot(cardBeforeGiftCardRedeem.rootElement, browserName, 'amount-before-giftcard-redeemed.png');

            const { paymentMethodDetailsLocator: givexDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('giftcard');
            const giftCard = new GiftCard(page, givexDetailsLocator);

            await giftCard.isComponentVisible();
            await giftCard.fillGiftCardNumber('6036280000000000000');
            await giftCard.fillPin('123');
            await giftCard.redeem();

            const redeemedGiftCards = page.locator('.adyen-checkout__order-payment-methods-list');
            await toHaveScreenshot(redeemedGiftCards, browserName, 'redeemed-gift-cards.png');
            const redeemedGiftCardInstruction = page.locator('.adyen-checkout__order-remaining-amount');
            await toHaveScreenshot(redeemedGiftCardInstruction, browserName, 'redeemed-gift-card-instruction.png');

            const { paymentMethodDetailsLocator: cardAfterGiftCardRedeemLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');
            const cardAfterGiftCardRedeem = new Card(page, cardAfterGiftCardRedeemLocator);
            await cardAfterGiftCardRedeem.isComponentVisible();
            await expect(cardAfterGiftCardRedeem.payButton).toContainText('Pay $209.00');

            await toHaveScreenshot(cardAfterGiftCardRedeem.rootElement, browserName, 'pay-amount-after-giftcard-redeemed.png');
        }
    );

    test(
        'Should show the correct updated amount after removing a redeemed gift card',
        { tag: [TAGS.SCREENSHOT] },
        async ({ dropinWithSession, page, browserName }) => {
            await dropinWithSession.goto(URL_MAP.dropinWithSession);

            const { paymentMethodDetailsLocator: givexDetailsLocator } = await dropinWithSession.selectNonStoredPaymentMethod('giftcard');
            const giftCard = new GiftCard(page, givexDetailsLocator);

            await giftCard.isComponentVisible();
            await giftCard.fillGiftCardNumber('6036280000000000000');
            await giftCard.fillPin('123');
            await giftCard.redeem();

            await expect(page.locator('.adyen-checkout__order-remaining-amount')).toBeVisible();

            const { paymentMethodDetailsLocator: cardBeforeGiftCardRemoveLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');
            const cardBeforeGiftCardRemove = new Card(page, cardBeforeGiftCardRemoveLocator);
            await cardBeforeGiftCardRemove.isComponentVisible();
            await expect(cardBeforeGiftCardRemove.payButton).toContainText('Pay $209.00');

            await page.getByRole('button', { name: 'Remove' }).click();

            const { paymentMethodDetailsLocator: cardAfterGiftCardRemoveLocator } = await dropinWithSession.selectNonStoredPaymentMethod('scheme');
            const cardAfterGiftCardRemove = new Card(page, cardAfterGiftCardRemoveLocator);
            await cardAfterGiftCardRemove.isComponentVisible();
            await expect(cardAfterGiftCardRemove.payButton).toContainText('Pay $259.00');

            await toHaveScreenshot(cardAfterGiftCardRemove.rootElement, browserName, 'amount-after-giftcard-removal.png');
        }
    );
});
