import CardComponentPage from '../../_models/CardComponent.page';

import { REGULAR_TEST_CARD } from '../utils/constants';
import { RequestMock, Selector } from 'testcafe';
import { BASE_URL } from '../../pages';

const cardPage = new CardComponentPage();

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
const mockedResponse = {
    brands: [
        {
            brand: 'cup', // keep as a recognised card brand (cup) until we have a genuine brand w. optional expiryDate
            cvcPolicy: 'optional',
            enableLuhnCheck: true,
            expiryDatePolicy: 'optional',
            supported: true
        }
    ],
    issuingCountryCode: 'US',
    requestId: null
};

const mock = RequestMock()
    .onRequestTo(request => {
        return request.url === cardPage.binLookupUrl && request.method === 'post';
    })
    .respond(
        (req, res) => {
            const body = JSON.parse(req.body);
            mockedResponse.requestId = body.requestId;
            res.setBody(mockedResponse);
        },
        200,
        {
            'Access-Control-Allow-Origin': BASE_URL
        }
    );

fixture`Test how Card Component handles different expiryDate policies`
    .clientScripts('expiryDate.clientScripts.js')
    .requestHooks(mock)
    .beforeEach(async t => {
        await t.navigateTo(cardPage.pageUrl);
    });

test('#1 Testing optional expiryDatePolicy - how UI & state respond', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Regular date label
    await t.expect(cardPage.dateLabelText.withText('(optional)').exists).notOk();

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // UI reflects that binLookup says expiryDate is optional
    await t.expect(cardPage.dateLabelText.withText('(optional)').exists).ok();

    // ...and cvc is optional too
    await t.expect(cardPage.cvcLabelText.withText('(optional)').exists).ok();

    // Card seen as valid (since CVC is optional too)
    await t.expect(cardPage.getFromState('isValid')).eql(true);

    // Clear number and see UI & state reset
    await cardPage.cardUtils.deleteCardNumber(t);
    await t
        .expect(cardPage.dateLabelText.withText('(optional)').exists)
        .notOk()
        .expect(cardPage.cvcLabelText.withText('(optional)').exists)
        .notOk()
        .expect(cardPage.getFromState('isValid'))
        .eql(false);
});

test('#2 Testing optional expiryDatePolicy - how securedField responds', async t => {
    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Expect iframe to exist in expiryDate field with aria-required attr set to true
    await t
        .switchToIframe(cardPage.iframeSelector.nth(1))
        .expect(Selector('[data-fieldtype="encryptedExpiryDate"]').getAttribute('aria-required'))
        .eql('true')
        .switchToMainWindow();

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Expect iframe to exist in expiryDate field and with aria-required attr set to false
    await t
        .switchToIframe(cardPage.iframeSelector.nth(1))
        .expect(Selector('[data-fieldtype="encryptedExpiryDate"]').getAttribute('aria-required'))
        .eql('false')
        .switchToMainWindow();

    // Clear number and see SF's aria-required reset
    await cardPage.cardUtils.deleteCardNumber(t);

    await t
        .switchToIframe(cardPage.iframeSelector.nth(1))
        .expect(Selector('[data-fieldtype="encryptedExpiryDate"]').getAttribute('aria-required'))
        .eql('true')
        .switchToMainWindow();
});

test('#3 Testing optional expiryDatePolicy - validating fields first and then entering PAN should see errors cleared from both UI & state', async t => {
    // This test, if run at full speed, *after* test #1, can fail to clear the PAN error - wtf? thanks testcafe!
    await t.setTestSpeed(0.75);

    // Wait for field to appear in DOM
    await cardPage.numHolder();

    // Click pay
    await t.click('.adyen-checkout__card-input .adyen-checkout__button--pay');

    // Expect errors in UI
    await t
        .expect(cardPage.numLabelTextError.exists)
        .ok()
        .expect(cardPage.dateLabelTextError.exists)
        .ok()
        .expect(cardPage.cvcLabelTextError.exists)
        .ok();

    // Expect errors in (mapped) state
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate'))
        .notEql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedSecurityCode'))
        .notEql(null);

    // Fill number to provoke (mock) binLookup response
    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

    // Expect errors to be cleared - since the fields were in error because they were empty
    // and now the PAN field is filled and the date & cvc fields are now optional...

    // ...UI errors cleared...
    await t
        .expect(cardPage.numLabelTextError.exists)
        .notOk()
        .expect(cardPage.dateLabelTextError.exists)
        .notOk()
        .expect(cardPage.cvcLabelTextError.exists)
        .notOk();

    // ...State errors cleared
    await t
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedExpiryDate'))
        .eql(null)
        .expect(cardPage.getFromWindow('mappedStateErrors.encryptedSecurityCode'))
        .eql(null);
});
