import { test } from '@playwright/test';

const INVALID_POSTALCODE = 'aaaaaaaaaa';

test.describe('Card with Partial AVS', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(CARDS_URL);
    });

    test('should validate Postal Code if property data.billingAddress.country is provided', async t => {
        // use CLIENTSCRIPT_PARTIAL_AVS_WITH_COUNTRY
        // await start(t, 2000, TEST_SPEED);
        //
        // await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        // await cardPage.cardUtils.fillDateAndCVC(t);
        //
        // await t.typeText(cardPage.postalCodeInput, INVALID_POSTALCODE);
        // await t.click(cardPage.payButton);
        //
        // await t.expect(cardPage.postalCodeErrorText.innerText).contains('Invalid format. Expected format: 12345678 or 12345-678');
    });

    test('should not validate Postal Code if property data.billingAddress.country is not provided', async t => {
        // use CLIENTSCRIPT_PARTIAL_AVS_WITHOUT_COUNTRY
        // await t.setNativeDialogHandler(() => true);
        // await start(t, 2000, TEST_SPEED);
        //
        // await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        // await cardPage.cardUtils.fillDateAndCVC(t);
        //
        // await t.typeText(cardPage.postalCodeInput, INVALID_POSTALCODE);
        // await t.click(cardPage.payButton);
        //
        // await t.wait(3000);
        //
        // // Check the value of the alert text
        // const history = await t.getNativeDialogHistory();
        // await t.expect(history[0].text).eql('Authorised');
    });
});
