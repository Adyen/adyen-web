import type { Page } from '@playwright/test';
import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { Card } from '../../../../models/card';
import { GiftCard } from '../../../../models/giftcard';
import type { DropinWithSession } from '../../../../models/dropinWithSession';
import { paymentMethodBalanceMock, removePaymentMethodBalanceMock } from '../../../../mocks/paymentMethodBalance/paymentMethodBalance.mock';
import { zeroBalanceMockData, serverErrorMockData } from '../../../../mocks/paymentMethodBalance/paymentMethodBalance.data';
import LANG from '../../../../../server/translations/en-US.json';
import { toHaveScreenshot } from '../../../utils/assertions';
import { CARD_HEADER_LABEL, TAGS } from '../../../utils/constants';

test.describe('Dropin - Sessions - GiftCards', () => {
    test(
        'Should show the correct updated amount after redeeming a gift card',
        { tag: [TAGS.SCREENSHOT] },
        async ({ dropinWithSession, page, browserName }) => {
            await dropinWithSession.goto(URL_MAP.dropinWithSession);

            const selectCardPaymentMethod = async () => {
                const item = dropinWithSession.getPaymentMethodHeader(CARD_HEADER_LABEL);
                await item.rootElement.click();
                return new Card(page, item.rootElement);
            };

            const cardBeforeGiftCardRedeem = await selectCardPaymentMethod();
            await cardBeforeGiftCardRedeem.isComponentVisible();
            await expect(cardBeforeGiftCardRedeem.payButton).toHaveText('Pay $259.00');

            const giftcardPaymentMethodHeaderLocator = dropinWithSession.getPaymentMethodHeader('Generic GiftCard');
            await giftcardPaymentMethodHeaderLocator.rootElement.click();
            const giftCard = new GiftCard(page, giftcardPaymentMethodHeaderLocator.rootElement);

            await giftCard.isComponentVisible();
            await giftCard.fillGiftCardNumber('6036280000000000000');
            await giftCard.fillPin('123');
            await giftCard.redeem();

            const redeemedGiftCards = page.locator('.adyen-checkout__order-payment-methods-list');
            await toHaveScreenshot(redeemedGiftCards, browserName, 'redeemed-gift-cards.png', {
                mask: [page.getByTestId('brand-image-wrapper')]
            });
            const redeemedGiftCardInstruction = page.locator('.adyen-checkout__order-remaining-amount');
            await toHaveScreenshot(redeemedGiftCardInstruction, browserName, 'redeemed-gift-card-instruction.png');

            const cardAfterGiftCardRedeem = await selectCardPaymentMethod();
            await cardAfterGiftCardRedeem.isComponentVisible();
            await expect(cardAfterGiftCardRedeem.payButton).toContainText('Pay $209.00');
        }
    );

    test('Should show the correct updated amount after removing a redeemed gift card', async ({ dropinWithSession, page }) => {
        await dropinWithSession.goto(URL_MAP.dropinWithSession);

        const giftcardPaymentMethodHeaderLocator = dropinWithSession.getPaymentMethodHeader('Generic GiftCard');
        await giftcardPaymentMethodHeaderLocator.rootElement.click();
        const giftCard = new GiftCard(page, giftcardPaymentMethodHeaderLocator.rootElement);

        await giftCard.isComponentVisible();
        await giftCard.fillGiftCardNumber('6036280000000000000');
        await giftCard.fillPin('123');
        await giftCard.redeem();

        await expect(page.locator('.adyen-checkout__order-remaining-amount')).toBeVisible();

        const selectCardPaymentMethod = async () => {
            const item = dropinWithSession.getPaymentMethodHeader(CARD_HEADER_LABEL);
            await item.rootElement.click();
            return new Card(page, item.rootElement);
        };

        const cardBeforeGiftCardRemove = await selectCardPaymentMethod();
        await cardBeforeGiftCardRemove.isComponentVisible();
        await expect(cardBeforeGiftCardRemove.payButton).toContainText('Pay $209.00');

        await page.getByRole('button', { name: 'Remove' }).click();

        await expect(page.locator('.adyen-checkout__order-payment-methods-list')).toBeHidden();

        const cardAfterGiftCardRemove = await selectCardPaymentMethod();
        await cardAfterGiftCardRemove.isComponentVisible();
        await expect(cardAfterGiftCardRemove.payButton).toContainText('Pay $259.00');
    });

    test.describe('Failed balance check', () => {
        const openGiftCard = async (dropinWithSession: DropinWithSession, page: Page) => {
            await dropinWithSession.goto(URL_MAP.dropinWithSession);

            const giftcardPaymentMethodHeaderLocator = dropinWithSession.getPaymentMethodHeader('Generic GiftCard');
            await giftcardPaymentMethodHeaderLocator.rootElement.click();
            const giftCard = new GiftCard(page, giftcardPaymentMethodHeaderLocator.rootElement);

            await giftCard.isComponentVisible();
            await giftCard.fillGiftCardNumber('6036280000000000000');
            await giftCard.fillPin('123');

            return giftCard;
        };

        test('Should show the inline error and re-enable the pay button when the card has zero balance', async ({ dropinWithSession, page }) => {
            await paymentMethodBalanceMock(page, zeroBalanceMockData);
            const giftCard = await openGiftCard(dropinWithSession, page);

            await giftCard.redeem();

            await expect(giftCard.rootElement.getByText(LANG['error.giftcard.no-balance'])).toBeVisible();
            await expect(giftCard.payButton).toBeEnabled();

            await removePaymentMethodBalanceMock(page);
            await giftCard.redeem();

            await expect(page.locator('.adyen-checkout__order-remaining-amount')).toBeVisible();
        });

        test('Should show the error banner and re-enable the pay button when the balance check fails with a server error', async ({
            dropinWithSession,
            page
        }) => {
            await paymentMethodBalanceMock(page, serverErrorMockData, 500);
            const giftCard = await openGiftCard(dropinWithSession, page);

            await giftCard.redeem();

            await expect(giftCard.rootElement.getByText(LANG['error.message.unknown'])).toBeVisible();
            await expect(giftCard.payButton).toBeEnabled();

            await removePaymentMethodBalanceMock(page);
            await giftCard.redeem();

            await expect(page.locator('.adyen-checkout__order-remaining-amount')).toBeVisible();
        });
    });
});
