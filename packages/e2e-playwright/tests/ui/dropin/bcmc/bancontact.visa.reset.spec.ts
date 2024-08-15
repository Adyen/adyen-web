import { test } from '../../../../fixtures/dropin.fixture';

const cvcSpan = '.adyen-checkout__dropin .adyen-checkout__field__cvc';
const brandingIcon = '.adyen-checkout__dropin .adyen-checkout__card__cardNumber__brandIcon';
const dualBrandingIconHolderActive = '.adyen-checkout__payment-method--bcmc .adyen-checkout__card__dual-branding__buttons--active';
const iframe = '.adyen-checkout__payment-method--bcmc iframe';

test.describe('Testing Bancontact in Dropin', () => {
    // todo: create fixture
    test.beforeEach(async () => {
        // Navigate to drop in page, with correct dropin config from bancontact.clientScripts.js to construct the URL
        // await t.navigateTo(`${dropinPage.pageUrl}?countryCode=BE`);
        // preselect the Bancontact payment method item from the dropin - selector .adyen-checkout__payment-method--bcmc
    });
    test(
        '#1 Enter card number, that we mock to co-branded bcmc/visa ' +
            'then click Visa logo and expect CVC field to show, then' +
            'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
            'ensure that bcmc logo shows & CVC field is hidden',
        async () => {
            // await start(t, 2000, TEST_SPEED);
            //
            // await cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);
            //
            // await t
            //     .expect(dualBrandingIconHolderActive.exists)
            //     .ok()
            //     .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            //     .eql('bcmc')
            //     .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            //     .eql('visa');
            //
            // // Click Visa brand icon
            // await t.click(dualBrandingIconHolderActive.find('img').nth(1));
            //
            // // Visible CVC field
            // await t.expect(cvcSpan.filterVisible().exists).ok();
            //
            // // Expect iframe to exist in CVC field and with aria-required set to true
            // await t
            //     .switchToIframe(iframe.nth(2))
            //     .expect('[data-fieldtype="encryptedSecurityCode"]'.getAttribute('aria-required'))
            //     .eql('true')
            //     .switchToMainWindow();
            //
            // await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup
            //
            // // Hidden CVC field
            // await t.expect(cvcSpan.filterHidden().exists).ok();
            //
            // await t
            //     // bcmc card icon
            //     .expect(brandingIcon.getAttribute('alt'))
            //     .contains('Bancontact card');
        }
    );
    test(
        '#2 Enter card number, that we mock to co-branded bcmc/visa ' +
            'then click Visa logo and expect CVC field to show, then' +
            'delete card number and ' +
            'ensure that bcmc logo shows & CVC field is hidden',
        async () => {
            // await start(t, 2000, TEST_SPEED);
            //
            // await cardUtils.fillCardNumber(t, BCMC_DUAL_BRANDED_VISA);
            //
            // await t
            //     .expect(dualBrandingIconHolderActive.exists)
            //     .ok()
            //     .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            //     .eql('bcmc')
            //     .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            //     .eql('visa');
            //
            // // Click Visa brand icon
            // await t.click(dualBrandingIconHolderActive.find('img').nth(1));
            //
            // // Visible CVC field
            // await t.expect(cvcSpan.filterVisible().exists).ok();
            //
            // // Expect iframe to exist in CVC field and with aria-required set to true
            // await t
            //     .switchToIframe(iframe.nth(2))
            //     .expect('[data-fieldtype="encryptedSecurityCode"]'.getAttribute('aria-required'))
            //     .eql('true')
            //     .switchToMainWindow();
            //
            // await cardUtils.deleteCardNumber(t);
            //
            // // Hidden CVC field
            // await t.expect(cvcSpan.filterHidden().exists).ok();
            //
            // await t
            //     // bcmc card icon
            //     .expect(brandingIcon.getAttribute('alt'))
            //     .contains('Bancontact card');
        }
    );
});
