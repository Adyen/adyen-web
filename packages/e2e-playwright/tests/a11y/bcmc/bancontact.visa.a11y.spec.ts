import { test } from '@playwright/test';

test('BCMC logo should have correct alt text', async () => {
    // wait for card number field shown
    // await fillCardNumber(t, '41');
    // BCMC logo still in number field
    // await t.expect(cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();
    // Hidden cvc field - check aria hidden?
});

test('Visa logo should have correct alt text', async () => {});

test(
    '#4 Enter card number (co-branded bcmc/visa) ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then click BCMC logo and expect comp to be valid again',
    async () => {
        // Wait for field to appear in DOM
        // fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);
        // fillDate(t, TEST_DATE_VALUE);
        // Expect drop in to be valid? - todo move this test to dropin?
        // Click Visa brand icon
        // Expect visible CVC field
        // Expect iframe to exist in CVC field and with aria-required set to true
        // await checkIframeForAttrVal(t, 2, 'encryptedSecurityCode', 'aria-required', 'true');
        // Expect dropin not to be valid
        // Click BCMC brand icon
        // Eppect hidden CVC field
        // Expect dropin to be valid (also check that it is set on state for this PM)
        // Expect the active payment to be valid (also check that it is set on state for this PM)
    }
);

test(
    '#5 Enter card number, that we mock to co-branded bcmc/visa ' +
        'then complete expiryDate and expect comp to be valid' +
        'then click Visa logo and expect comp to not be valid' +
        'then enter CVC and expect comp to be valid',
    async () => {
        // Wait for field to appear in DOM
        // fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);
        // fillDate(t, TEST_DATE_VALUE);
        // Expect dropin.isValid
        // Click Visa brand icon
        // Expect dropin.isValid not to be valid
        // fill CVC
        // Expect dropin.isValid to now be valid
    }
);

test(
    '#6 Enter Visa card number ' +
        'then delete it' +
        'then re-add it' +
        'and expect Visa logo to be shown a second time (showing CSF has reset state)',
    async () => {
        // Wait for field to appear in DOM
        // Add Visa num (dual branded, but with Carte Bancaire, so only recognised as Visa)
        // fillCardNumber(t, DUAL_BRANDED_CARD);
        // Expect Visa logo in number field
        // expect(cc.brandingIcon.withAttribute('alt', 'VISA').exists).ok();
        // await deleteCardNumber(t);
        // Expect BCMC logo in number field
        // await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'Bancontact card').exists).ok();
        // Re-add Visa num
        // await dropinPage.cc.cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);
        // Expect Visa logo in number field again
        // await t.expect(dropinPage.cc.brandingIcon.withAttribute('alt', 'VISA').exists).ok();
    }
);
