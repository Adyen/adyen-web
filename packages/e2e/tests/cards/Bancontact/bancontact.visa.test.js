import DropinPage from '../../_models/Dropin.page';
import { binLookupUrl, getBinLookupMock, turnOffSDKMocking } from '../../_common/cardMocks';
import { DUAL_BRANDED_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';

const dropinPage = new DropinPage('.adyen-checkout__payment-method--bcmc');

/**
 * NOTE - we are mocking the response until such time as we have the correct BIN in the Test DB
 */
const mockedResponse = {
    brands: [
        {
            brand: 'bcmc',
            cvcPolicy: 'hidden',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
        },
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: true,
            supported: true
        }
    ],
    issuingCountryCode: 'BE',
    requestId: null
};

const mock = getBinLookupMock(binLookupUrl, mockedResponse);

fixture`Testing Bancontact in Dropin`
    .beforeEach(async t => {
        await t.navigateTo(`${dropinPage.pageUrl}?countryCode=BE`);
        await turnOffSDKMocking();
    })
    .requestHooks(mock)
    .clientScripts('./bancontact.clientScripts.js');

test('Check Bancontact comp is correctly presented at startup', async t => {
    // Wait for field to appear in DOM
    await dropinPage.numSpan();

    await t.expect(dropinPage.brandsImages.count).eql(3);

    // Expect 3 card brand logos to be displayed (not concerned about order)
    await t
        .expect(dropinPage.brandsHolder.exists)
        .ok()
        .expect(dropinPage.brandsImages.withAttribute('alt', 'bcmc').exists)
        .ok()
        .expect(dropinPage.brandsImages.withAttribute('alt', 'visa').exists)
        .ok()
        .expect(dropinPage.brandsImages.withAttribute('alt', 'maestro').exists)
        .ok();

    // Hidden cvc field
    await t.expect(dropinPage.cvcHolder.filterHidden().exists).ok();

    // BCMC logo in number field
    await t
        .expect(dropinPage.numSpan.exists)
        .ok()
        .expect(dropinPage.brandingIcon.withAttribute('alt', 'bcmc').exists)
        .ok();
});

test('Entering digits that our local regEx will recognise as Visa does not affect the UI', async t => {
    await dropinPage.numSpan();

    await dropinPage.cardUtils.fillCardNumber(t, '41');

    // BCMC logo still in number field
    await t.expect(dropinPage.brandingIcon.withAttribute('alt', 'bcmc').exists).ok();

    // Hidden cvc field
    await t.expect(dropinPage.cvcHolder.filterHidden().exists).ok();
});

test('Enter card number, that we mock to co-branded bcmc/visa ' + 'then complete expiryDate and expect comp to be valid', async t => {
    await dropinPage.numSpan();

    await dropinPage.cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

    // Dual branded with bcmc logo shown first
    await t
        .expect(dropinPage.dualBrandingIconHolderActive.exists)
        .ok()
        .expect(dropinPage.dualBrandingImages.nth(0).withAttribute('data-value', 'bcmc').exists)
        .ok()
        .expect(dropinPage.dualBrandingImages.nth(1).withAttribute('data-value', 'visa').exists)
        .ok();

    await dropinPage.cardUtils.fillDate(t, TEST_DATE_VALUE);

    // Expect comp to now be valid
    await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
});

test(
    'Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then click BCMC logo and expect comp to be valid again',
    async t => {
        // Wait for field to appear in DOM
        await dropinPage.numSpan();

        await dropinPage.cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await dropinPage.cardUtils.fillDate(t, TEST_DATE_VALUE);

        // Expect comp to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

        // Click Visa brand icon
        await t.click(dropinPage.dualBrandingImages.nth(1));

        // Visible CVC field
        await t.expect(dropinPage.cvcHolder.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        await dropinPage.cardUtils.checkIframeForAttrVal(t, 2, 'encryptedSecurityCode', 'aria-required', 'true');

        // Expect comp not to be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(false);

        // Click BCMC brand icon
        await t.click(dropinPage.dualBrandingImages.nth(0));

        // Hidden CVC field
        await t.expect(dropinPage.cvcHolder.filterHidden().exists).ok();

        // Expect comp to be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
    }
);

test(
    'Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then enter CVC and expect comp to be valid',
    async t => {
        // Wait for field to appear in DOM
        await dropinPage.numSpan();

        await dropinPage.cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await dropinPage.cardUtils.fillDate(t, TEST_DATE_VALUE);

        // Expect comp to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

        // Click Visa brand icon
        await t.click(dropinPage.dualBrandingImages.nth(1));

        // Expect comp not to be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(false);

        // fill CVC
        await dropinPage.cardUtils.fillCVC(t, TEST_CVC_VALUE);

        // Expect comp to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
    }
);
