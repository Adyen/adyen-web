import { test } from '@playwright/test';

// Applies to regular, single date field custom card
const iframeSelectorRegular = '.secured-fields iframe';
// Applies to custom card with separate date fields
const iframeSelectorSeparate = '.secured-fields-2 iframe';

test.describe('Testing Custom Cards completion and payment', () => {
    test.beforeEach(async () => {
        //await t.navigateTo(CUSTOMCARDS_URL);
    });
    test('Can fill out the fields in the regular custom card and make a successful payment', async t => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // handler for alert that's triggered on successful payment
        // await t.setNativeDialogHandler(() => true);
        //
        // await cardUtilsRegular.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // await cardUtilsRegular.fillDateAndCVC(t);
        //
        // // click pay
        // await t
        //   .click('.secured-fields .adyen-checkout__button')
        //   // no visible errors
        //   .expect(Selector('.pm-form-label__error-text').filterHidden().exists)
        //   .ok()
        //   .wait(2000);
        //
        // // Check the value of the alert text
        // const history = await t.getNativeDialogHistory();
        // await t.expect(history[0].text).eql('Authorised');
    });

    test('Can fill out the fields in the separate custom card and make a successful payment', async t => {
        // Start, allow time for iframes to load
        // await start(t, 2000, TEST_SPEED);
        //
        // // handler for alert that's triggered on successful payment
        // await t.setNativeDialogHandler(() => true);
        //
        // await cardUtilsSeparate.fillCardNumber(t, REGULAR_TEST_CARD);
        //
        // await customCardUtils.fillMonth(t, TEST_MONTH_VALUE);
        // await customCardUtils.fillYear(t, TEST_YEAR_VALUE);
        //
        // await customCardUtils.fillCVC(t, TEST_CVC_VALUE);
        //
        // // click pay
        // await t
        //   .click('.secured-fields-2 .adyen-checkout__button')
        //   // no visible errors
        //   .expect(Selector('.pm-form-label__error-text').filterHidden().exists)
        //   .ok()
        //   .wait(2000);
        //
        // // Check the value of the alert text
        // const history = await t.getNativeDialogHistory();
        // await t.expect(history[0].text).eql('Authorised');
    });
});
