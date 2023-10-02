import DropinPage from '../../_models/Dropin.page';
import CardComponentPage from '../../_models/CardComponent.page';
import { BCMC_DUAL_BRANDED_VISA, DUAL_BRANDED_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';
import { Selector } from 'testcafe';

const dropinPage = new DropinPage({
    components: {
        cc: new CardComponentPage('.adyen-checkout__payment-method--bcmc')
    }
});

fixture`Testing Bancontact in Dropin`
    .beforeEach(async t => {
        await t.navigateTo(`${dropinPage.pageUrl}?countryCode=BE`);
    })
    .clientScripts('./bancontact.clientScripts.js');

test('#1 Check Bancontact comp is correctly presented at startup', async t => {
    // Wait for field to appear in DOM
    await t.wait(1000);

    const brandsInsidePaymentMethod = Selector('.adyen-checkout__card__brands');
    const images = brandsInsidePaymentMethod.find('img');

    // Expect 3 card brand logos to be displayed (not concerned about order)
    await t.expect(images.count).eql(3);
    await t
        .expect(images.nth(0).getAttribute('src'))
        .contains('bcmc.svg')
        .expect(images.nth(1).getAttribute('src'))
        .contains('visa.svg')
        .expect(images.nth(2).getAttribute('src'))
        .contains('maestro.svg');

    // Hidden cvc field
    await t.expect(dropinPage.cc.cvcHolder.filterHidden().exists).ok();

    // BCMC logo in number field
    await t.expect(dropinPage.cc.numSpan.exists).ok().expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();
});

test('#2 Entering digits that our local regEx will recognise as Visa does not affect the UI', async t => {
    await dropinPage.cc.numSpan();

    await dropinPage.cc.cardUtils.fillCardNumber(t, '41');

    // BCMC logo still in number field
    await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();

    // Hidden cvc field
    await t.expect(dropinPage.cc.cvcHolder.filterHidden().exists).ok();
});

test('#3 Enter card number, that we mock to co-branded bcmc/visa ' + 'then complete expiryDate and expect comp to be valid', async t => {
    await dropinPage.cc.numSpan();

    await dropinPage.cc.cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);

    // Dual branded with bcmc logo shown first
    await t
        .expect(dropinPage.dualBrandingIconHolderActive.exists)
        .ok()
        .expect(dropinPage.dualBrandingImages.nth(0).withAttribute('data-value', 'bcmc').exists)
        .ok()
        .expect(dropinPage.dualBrandingImages.nth(1).withAttribute('data-value', 'visa').exists)
        .ok();

    await dropinPage.cc.cardUtils.fillDate(t, TEST_DATE_VALUE);

    // Expect comp to now be valid
    await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
});

test(
    '#4 Enter card number (co-branded bcmc/visa) ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then click BCMC logo and expect comp to be valid again',
    async t => {
        // Wait for field to appear in DOM
        await dropinPage.cc.numSpan();

        await dropinPage.cc.cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);

        await dropinPage.cc.cardUtils.fillDate(t, TEST_DATE_VALUE);

        // Expect comp to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

        // Click Visa brand icon
        await t.click(dropinPage.dualBrandingImages.nth(1));

        // Visible CVC field
        await t.expect(dropinPage.cc.cvcHolder.filterVisible().exists).ok();

        // Expect iframe to exist in CVC field and with aria-required set to true
        await dropinPage.cc.cardUtils.checkIframeForAttrVal(t, 2, 'encryptedSecurityCode', 'aria-required', 'true');

        // Expect comp not to be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(false);

        // Click BCMC brand icon
        await t.click(dropinPage.dualBrandingImages.nth(0));

        // Hidden CVC field
        await t.expect(dropinPage.cc.cvcHolder.filterHidden().exists).ok();

        // Expect comp to be valid (also check that it is set on state for this PM)
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
        await t.expect(dropinPage.getFromActivePM('state.isValid')).eql(true);
    }
);

test(
    '#5 Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then enter CVC and expect comp to be valid',
    async t => {
        // Wait for field to appear in DOM
        await dropinPage.cc.numSpan();

        await dropinPage.cc.cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);

        await dropinPage.cc.cardUtils.fillDate(t, TEST_DATE_VALUE);

        // Expect comp to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);

        // Click Visa brand icon
        await t.click(dropinPage.dualBrandingImages.nth(1));

        // Expect comp not to be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(false);

        // fill CVC
        await dropinPage.cc.cardUtils.fillCVC(t, TEST_CVC_VALUE);

        // Expect comp to now be valid
        await t.expect(dropinPage.getFromWindow('dropin.isValid')).eql(true);
    }
);

test(
    '#6 Enter Visa card number ' +
        'then delete it' +
        'then re-add it' +
        'and expect Visa logo to be shown a second time (showing CSF has reset state)',
    async t => {
        // Wait for field to appear in DOM
        await dropinPage.cc.numSpan();

        // Add Visa num (dual branded, but with Carte Bancaire, so only recognised as Visa)
        await dropinPage.cc.cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        // Expect Visa logo in number field
        await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'VISA').exists).ok();

        await dropinPage.cc.cardUtils.deleteCardNumber(t);

        // Expect BCMC logo in number field
        await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();

        // Re-add Visa num
        await dropinPage.cc.cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        // Expect Visa logo in number field again
        await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'VISA').exists).ok();
    }
);
