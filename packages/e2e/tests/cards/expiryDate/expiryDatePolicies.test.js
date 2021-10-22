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
            brand: 'bcmc', // keep as a recognised card brand (bcmc) until we have a genuine brand w. optional expiryDate
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

test.only('#2 Testing optional expiryDatePolicy - how securedField responds', async t => {
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
