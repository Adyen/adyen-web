import { test } from '../../../../fixtures/dropin.fixture';

test.describe('Testing Bancontact in Dropin', () => {
    // todo: create fixture
    test.beforeEach(async () => {
        // Navigate to drop in page, with correct dropin config from bancontact.clientScripts.js to construct the URL
        // await t.navigateTo(`${dropinPage.pageUrl}?countryCode=BE`);
        // preselect the Bancontact payment method item from the dropin - selector .adyen-checkout__payment-method--bcmc
    });

    test('#1 Check Bancontact comp is correctly presented at startup', async () => {
        // Wait for field to appear in DOM
        // await t.wait(1000);
        //
        // const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
        // const images = brandsInsidePaymentMethod.find('img');
        //
        // // Expect 4 card brand logos to be displayed (not concerned about order)
        // await t.expect(images.count).eql(4);
        // await t
        //     .expect(images.nth(0).getAttribute('src'))
        //     .contains('bcmc.svg')
        //     .expect(images.nth(1).getAttribute('src'))
        //     .contains('mc.svg')
        //     .expect(images.nth(2).getAttribute('src'))
        //     .contains('visa.svg')
        //     .expect(images.nth(3).getAttribute('src'))
        //     .contains('maestro.svg');
        //
        // // Hidden cvc field
        // await t.expect(dropinPage.cc.cvcHolder.filterHidden().exists).ok();
        //
        // // BCMC logo in number field
        // await t.expect(dropinPage.cc.numSpan.exists).ok().expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();
    });

    test('#2 Entering digits that our local regEx will recognise as Visa does not affect the UI', async () => {
        // await dropinPage.cc.numSpan();
        //
        // await dropinPage.cc.cardUtils.fillCardNumber(t, '41');
        //
        // // BCMC logo still in number field
        // await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();
        //
        // // Hidden cvc field
        // await t.expect(dropinPage.cc.cvcHolder.filterHidden().exists).ok();
    });

    test('#3 Enter card number, that we mock to co-branded bcmc/visa ' + 'then complete expiryDate and expect comp to be valid', async () => {
        // await dropinPage.cc.numSpan();
        //
        // await dropinPage.cc.cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);
        //
        // // Dual branded with bcmc logo shown first
        // await t
        //     .expect(dropinPage.dualBrandingIconHolderActive.exists)
        //     .ok()
        //     .expect(dropinPage.dualBrandingImages.nth(0).withAttribute('data-value', 'bcmc').exists)
        //     .ok()
        //     .expect(dropinPage.dualBrandingImages.nth(1).withAttribute('data-value', 'visa').exists)
        //     .ok();
        //
        // await dropinPage.cc.cardUtils.fillDate(t, TEST_DATE_VALUE);
        //
        // // Expect comp to now be valid
        // await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true, { timeout: 3000 });
    });

    /** #4, #5, #6 in a11y/bcmc/bancontact.visa.a11y.spec.ts */
});
