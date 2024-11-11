import { test as base, expect } from '@playwright/test';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, TEST_POSTCODE } from '../../utils/constants';
import { CardWithAvs } from '../../../models/card-avs';
import { URL_MAP } from '../../../fixtures/URL_MAP';

type Fixture = {
    cardAvsPage: CardWithAvs;
};

const test = base.extend<Fixture>({
    cardAvsPage: async ({ page }, use) => {
        const cardAvcPage = new CardWithAvs(page);
        await cardAvcPage.goto(URL_MAP.cardWithPartialAvs);
        await use(cardAvcPage);
    }
});

test.describe('Card payments with address lookup', () => {});

test.describe('Card payments with partial avs', () => {
    test.describe('When fill in a valid the post code', () => {
        test('should make a successful card payment', async ({ cardAvsPage }) => {
            await cardAvsPage.fillCardNumber(REGULAR_TEST_CARD);
            await cardAvsPage.fillExpiryDate(TEST_DATE_VALUE);
            await cardAvsPage.fillCvc(TEST_CVC_VALUE);
            await cardAvsPage.fillInPostCode(TEST_POSTCODE);
            await cardAvsPage.pay();
            await cardAvsPage.paymentResult.waitFor({ state: 'visible' });
            await expect(cardAvsPage.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('When not fill in a post code ', () => {
        test('should not submit the payment', async ({ cardAvsPage }) => {
            await cardAvsPage.fillCardNumber(REGULAR_TEST_CARD);
            await cardAvsPage.fillExpiryDate(TEST_DATE_VALUE);
            await cardAvsPage.fillCvc(TEST_CVC_VALUE);
            await cardAvsPage.pay();

            //await expect(cardAvsPage.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            // fill in card number
            // fill in expiry date
            // fill in cvc
            // fill in post code
            // click pay btn
            // expect to see error message under the post code field
        });
    });
});

test.describe('Card payments with full avs', () => {
    test.describe('When fill in the valid address data', () => {
        test('should make a successful card payment', async ({ page }) => {
            // fill in card number
            // fill in expiry date
            // fill in cvc
            // fill in address ...
            // click pay btn
            // expect to see success result
        });
    });

    test.describe('When fill in the invalid address data', () => {
        test('should not submit the payment', async ({ page }) => {
            // fill in card number
            // fill in expiry date
            // fill in cvc
            // skip required fields in address section
            // click pay btn
            // expect to see error message
        });
    });

    test.describe('When switching to a different delivery country', () => {
        test('should make a successful card payment', async ({ page }) => {
            // prefilled wrong address
            // user sees error msg
            // change the country code
            // submit payment successfully
        });
        test('should not submit the payment', async ({ page }) => {
            // prefilled correct address
            // change the country code
            // user sees error msg
            // user cannot submit payment
        });
    });
});
//packages/e2e-playwright/tests/e2e/card/avs.spec.ts
