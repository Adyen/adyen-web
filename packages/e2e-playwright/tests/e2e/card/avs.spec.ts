import { test, expect } from '../../../pages/cards/card.fixture';
import { URL_MAP } from '../../../pages/cards/URL_MAP';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, TEST_MONTH_VALUE, TEST_POSTCODE } from '../../utils/constants';

test.describe('Card payments with address lookup', () => {});

test.describe('Card payments with partial avs', () => {
    test.describe('When fill in a valid the post code', () => {
        test.only('should make a successful card payment', async ({ cardAvsPage }) => {
            await cardAvsPage.goto(URL_MAP.cardWithPartialAvs);
            await cardAvsPage.isComponentVisible();
            await cardAvsPage.typeCardNumber(REGULAR_TEST_CARD);
            await cardAvsPage.typeExpiryDate(TEST_DATE_VALUE);
            await cardAvsPage.typeCvc(TEST_CVC_VALUE);
            await cardAvsPage.fillInPostCode(TEST_POSTCODE);
            await cardAvsPage.pay();
        });
    });

    test.describe('When fill in an invalid post code ', () => {
        // in the before hook, do not provide country code
        test('should not submit the payment', async ({ page }) => {
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
