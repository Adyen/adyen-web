import { JWE_ALG, JWE_CONTENT_ALG, JWE_VERSION, KOREAN_TEST_CARD, REGULAR_TEST_CARD, TEST_TAX_NUMBER_VALUE } from '../../utils/constants';
import CardComponentPage from '../../../_models/CardComponent.page';
import { turnOffSDKMocking } from '../../../_common/cardMocks';

const cardPage = new CardComponentPage();

fixture`Starting with KCP fields`
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
        await turnOffSDKMocking();
    })
    .clientScripts('./startWithKCP.clientScripts.js');

test(
    '#1 Fill in card number that will hide KCP fields, ' +
        'then check password iframe is hidden, ' +
        'then complete the form & check component becomes valid',
    async t => {
        // Wait for field to appear in DOM
        await cardPage.numHolder();

        // Fill card field with non-korean card
        await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

        // Does the password securedField get removed
        await t.expect(cardPage.pwdSpan.exists).notOk();

        // Complete form
        await cardPage.cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(cardPage.getFromState('isValid')).eql(true);
    }
);

test(
    '#2 Fill in all KCP details, ' +
        'then check card state for taxNumber & password entries, ' +
        'then replace card number with non-korean card and check taxNumber and password state are cleared',
    async t => {
        // For some reason, at full speed, testcafe can fail to fill in the taxNumber correctly
        await t.setTestSpeed(0.9);

        await cardPage.numHolder();

        // Complete form with korean card number
        await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
        await cardPage.cardUtils.fillDateAndCVC(t);
        await cardPage.kcpUtils.fillTaxNumber(t);
        await cardPage.kcpUtils.fillPwd(t);

        // Expect card to now be valid
        await t.expect(cardPage.getFromState('isValid')).eql(true);

        // Expect card state to have tax and pwd elements
        await t.expect(cardPage.getFromState('data.taxNumber')).eql(TEST_TAX_NUMBER_VALUE);

        // Extract & decode JWE header
        const JWEToken = await cardPage.getFromState('data.encryptedPassword');
        const JWETokenArr = JWEToken.split('.');
        const blobHeader = JWETokenArr[0];
        const base64Decoded = await cardPage.decodeBase64(blobHeader);
        const headerObj = JSON.parse(base64Decoded);

        // Look for expected properties
        await t.expect(JWETokenArr.length).eql(5); // Expected number of components in the JWE token

        await t
            .expect(headerObj.alg)
            .eql(JWE_ALG)
            .expect(headerObj.enc)
            .eql(JWE_CONTENT_ALG)
            .expect(headerObj.version)
            .eql(JWE_VERSION);

        // await t.expect(cardPage.getFromState('data.encryptedPassword')).contains('adyenjs_0_1_');

        await t.expect(cardPage.getFromState('valid.taxNumber')).eql(true);
        await t.expect(cardPage.getFromState('valid.encryptedPassword')).eql(true);

        // Replace number
        await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, 'replace');

        // (Does the password securedField get removed)
        await t.expect(cardPage.pwdSpan.exists).notOk();

        // Expect card state's tax and pwd elements to have been cleared/reset
        await t.expect(cardPage.getFromState('data.taxNumber')).eql(undefined);
        await t.expect(cardPage.getFromState('data.encryptedPassword')).eql(undefined);

        await t.expect(cardPage.getFromState('valid.taxNumber')).eql(false);
        await t.expect(cardPage.getFromState('valid.encryptedPassword')).eql(false);

        // Expect card to still be valid (get it from window.card this time - just to check that is also set)
        await t.expect(cardPage.getFromWindow('card.isValid')).eql(true);
    }
);

test(
    '#3 Fill in card number that will hide KCP fields, ' +
        'then complete form and expect component to be valid & to be able to pay,' +
        'then replace card number with korean card and expect component to be valid & to be able to pay',
    async t => {
        // For some reason, at full speed, testcafe can fail to fill in the taxNumber correctly
        await t.setTestSpeed(0.9);

        await cardPage.numHolder();

        // handler for alert that's triggered on successful payment
        await t.setNativeDialogHandler(() => true);

        // Complete form with regular card number
        await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
        await cardPage.cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(cardPage.getFromState('isValid')).eql(true);

        // Click pay - except we can't...
        await t;
        //            .click(cardPage.payButton) // Can't do this in testing scenario - for some reason it triggers a redirect to a hpp/collectKcpAuthentication page
        // ... & no errors
        await t.expect(cardPage.numLabelTextError.exists).notOk();

        // Replace number with korean card (pasting works better than replacing in textcafe >1.13.0)
        await cardPage.cardUtils.fillCardNumber(t, KOREAN_TEST_CARD, 'paste'); // 'replace'

        // Expect card to now be invalid
        await t.expect(cardPage.getFromState('isValid')).eql(false);

        // Complete form
        await cardPage.kcpUtils.fillTaxNumber(t);
        await cardPage.kcpUtils.fillPwd(t);

        // Expect card to now be valid
        await t.expect(cardPage.getFromState('isValid')).eql(true);

        // Click pay
        await t
            .click(cardPage.payButton)
            // no errors
            .expect(cardPage.numLabelTextError.exists)
            .notOk()
            .wait(1000);
    }
);
