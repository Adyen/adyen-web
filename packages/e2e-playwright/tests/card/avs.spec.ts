import { expect, test } from '../../pages/cards/card.fixture';

test.describe('Card payments with address lookup', () => {});

test.describe('Card payments with partial avs', () => {
    test.describe('When fill in a valid the post code', () => {
        test.only('should make a successful card payment', async ({ cardPartialAvsPage }) => {
            const { cardWithAvs, payButton, paymentResult } = cardPartialAvsPage;
            await expect(payButton).toBeVisible();
        });
    });

    test.describe('When fill in an invalid post code ', () => {
        // in the before hook, do not provide country code
        test('should not submit the payment', async ({ cardAvsPage }) => {
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
        test('should make a successful card payment', async ({ cardAvsPage }) => {
            // fill in card number
            // fill in expiry date
            // fill in cvc
            // fill in address ...
            // click pay btn
            // expect to see success result
        });
    });

    test.describe('When fill in the invalid address data', () => {
        test('should not submit the payment', async ({ cardAvsPage }) => {
            // fill in card number
            // fill in expiry date
            // fill in cvc
            // skip required fields in address section
            // click pay btn
            // expect to see error message
        });
    });

    test.describe('When switching to a different delivery country', () => {
        test('should make a successful card payment', async ({ cardAvsPage }) => {
            // prefilled wrong address
            // user sees error msg
            // change the country code
            // submit payment successfully
        });
        test('should not submit the payment', async ({ cardAvsPage }) => {
            // prefilled correct address
            // change the country code
            // user sees error msg
            // user cannot submit payment
        });
    });
});
