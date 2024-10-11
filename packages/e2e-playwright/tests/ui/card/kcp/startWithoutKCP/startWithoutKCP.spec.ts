import { test } from '@playwright/test';
import { turnOffSDKMocking } from '../../cardMocks';

test.describe('Starting without KCP fields', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(cardPage.pageUrl);
        await turnOffSDKMocking();
        //use startWithoutKCP.clientScripts.js
    });

    test(
        '#1 Fill in card number that will trigger addition of KCP fields, ' +
            'then check new iframe field is correctly set up, ' +
            'then complete the form & check component becomes valid',
        async () => {
            // For some reason, at full speed, testcafe can fail to fill in the taxNumber correctly
            // await t.setTestSpeed(0.5);
            //
            // // Wait for field to appear in DOM
            // await cardPage.numHolder();
            //
            // // Fill card field with korean card
            // await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
            //
            // // Does a newly added password securedField now exist with a state.valid entry, a holder and an iframe...?
            // await t
            //   .expect(cardPage.getFromState('valid.encryptedPassword'))
            //   .eql(false)
            //   .expect(cardPage.pwdSpan.exists)
            //   .ok()
            //   .expect(cardPage.pwdSpan.find('iframe').getAttribute('src'))
            //   .contains('securedFields.html');
            //
            // // ...and can we can type into the iframe?
            // await cardPage.kcpUtils.fillPwd(t);
            //
            // // Check pwd field for value
            // await cardPage.kcpUtils.checkPwd(t, TEST_PWD_VALUE);
            //
            // // // Complete form
            // await cardPage.cardUtils.fillDateAndCVC(t);
            // await cardPage.kcpUtils.fillTaxNumber(t);
            //
            // // // Expect card to now be valid
            // await t.expect(cardPage.getFromState('isValid')).eql(true);
        }
    );

    test(
        '#2 Fill in card number that will trigger addition of KCP fields, ' +
            'then fill in all KCP details & check card state for taxNumber & password entries, ' +
            'then delete card number and check taxNumber and password state are cleared',
        async () => {
            // For some reason, at full speed, testcafe can fail to fill in the taxNumber correctly
            // await t.setTestSpeed(0.5);
            //
            // await cardPage.numHolder();
            //
            // // Complete form with korean card number
            // await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
            // await cardPage.cardUtils.fillDateAndCVC(t);
            // await cardPage.kcpUtils.fillTaxNumber(t);
            // await cardPage.kcpUtils.fillPwd(t);
            //
            // // Expect card to now be valid
            // await t.expect(cardPage.getFromState('isValid')).eql(true);
            //
            // // Expect card state to have tax and pwd elements
            // await t.expect(cardPage.getFromState('data.taxNumber')).eql(TEST_TAX_NUMBER_VALUE);
            //
            // // Extract & decode JWE header
            // const JWEToken = await cardPage.getFromState('data.encryptedPassword');
            // const JWETokenArr = JWEToken.split('.');
            // const blobHeader = JWETokenArr[0];
            // const base64Decoded = await cardPage.decodeBase64(blobHeader);
            // const headerObj = JSON.parse(base64Decoded);
            //
            // // Look for expected properties
            // await t.expect(JWETokenArr.length).eql(5); // Expected number of components in the JWE token
            //
            // await t.expect(headerObj.alg).eql(JWE_ALG).expect(headerObj.enc).eql(JWE_CONTENT_ALG).expect(headerObj.version).eql(JWE_VERSION);
            //
            // // await t.expect(cardPage.getFromState('data.encryptedPassword')).contains('adyenjs_0_1_');
            //
            // await t.expect(cardPage.getFromState('valid.taxNumber')).eql(true);
            // await t.expect(cardPage.getFromState('valid.encryptedPassword')).eql(true);
            //
            // // Delete number
            // await cardPage.cardUtils.deleteCardNumber(t);
            //
            // // Expect card state's tax and pwd elements to have been cleared/reset
            // await t.expect(cardPage.getFromState('data.taxNumber')).eql(undefined);
            // await t.expect(cardPage.getFromState('data.encryptedPassword')).eql(undefined);
            //
            // await t.expect(cardPage.getFromState('valid.taxNumber')).eql(false);
            // await t.expect(cardPage.getFromState('valid.encryptedPassword')).eql(false);
            //
            // // Expect card to no longer be valid
            // await t.expect(cardPage.getFromState('isValid')).eql(false);
        }
    );

    test(
        '#3 Fill in card number that will trigger addition of KCP fields, ' +
            'then complete form and expect component to be valid & to be able to pay,' +
            'then replace card number with non-korean card and expect component to be valid & to be able to pay',
        async () => {
            // For some reason, at full speed, testcafe can fail to fill in the taxNumber correctly
            // await t.setTestSpeed(0.5);
            //
            // await cardPage.numHolder();
            //
            // // handler for alert that's triggered on successful payment
            // await t.setNativeDialogHandler(() => true);
            //
            // // Complete form with korean card number
            // await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
            // await cardPage.cardUtils.fillDateAndCVC(t);
            // await cardPage.kcpUtils.fillTaxNumber(t);
            // await cardPage.kcpUtils.fillPwd(t);
            //
            // // Expect card to now be valid
            // await t.expect(cardPage.getFromState('isValid')).eql(true);
            //
            // // click pay
            // await t
            //   .click(cardPage.payButton)
            //   // no errors
            //   .expect(cardPage.numLabelTextError.exists)
            //   .notOk();
            //
            // // Replace number with non-korean card
            // await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'replace');
            //
            // // Expect card to now be valid
            // await t.expect(cardPage.getFromState('isValid')).eql(true);
            //
            // // click pay
            // await t
            //   .click(cardPage.payButton)
            //   // no errors
            //   .expect(cardPage.numLabelTextError.exists)
            //   .notOk()
            //   .wait(1000);
        }
    );

    test(
        '#4 Fill in card number that will trigger addition of KCP fields, ' +
            'then complete form except for password field,' +
            'expect component not to be valid and for password field to show error',
        async () => {
            // For some reason, at full speed, testcafe can fail to fill in the taxNumber correctly
            // await t.setTestSpeed(0.5);
            //
            // await cardPage.numHolder();
            //
            // // Complete form with korean card number
            // await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
            // await cardPage.cardUtils.fillDateAndCVC(t);
            // await cardPage.kcpUtils.fillTaxNumber(t);
            //
            // // Expect card to not be valid
            // await t.expect(cardPage.getFromState('isValid')).eql(false);
            //
            // // click pay
            // await t
            //   .click(cardPage.payButton)
            //   // Expect error on password field
            //   .expect(cardPage.pwdErrorText.exists)
            //   .ok();
        }
    );
});
