import cu from '../utils/cardUtils';
import { ClientFunction, Selector } from 'testcafe';
import { start, getIsValid, getIframeSelector } from '../../utils/commonUtils';
import { BASE_URL } from '../../pages';
import { BCMC_CARD, UNKNOWN_VISA_CARD, REGULAR_TEST_CARD } from '../utils/constants';

const cvcSpan = Selector('.adyen-checkout__dropin .adyen-checkout__field__cvc');

const brandingIcon = Selector('.adyen-checkout__dropin .adyen-checkout__card__cardNumber__brandIcon');
const dualBrandingIconHolderActive = Selector('.adyen-checkout__payment-method--card .adyen-checkout__card__dual-branding__buttons--active');

const getPropFromPMData = ClientFunction(prop => {
    return window.dropin.dropinRef.state.activePaymentMethod.formatData().paymentMethod[prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing Card component, in Dropin, resetting brand after failed binLookup`
    .page(BASE_URL)
    .clientScripts('binLookup.branding.reset.clientScripts.js');

/**
 * SINGLE BRANDING RESETS
 */
test(
    'Fill in regular MC card then ' +
        'check that a brand has been set on PM data, then' +
        'paste in a card unrecognised by binLookup, ' +
        'check that the brand has been reset on paymentMethod data and ' +
        'that the internal regex have recognised the unrecognised card as Visa',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD); // mc

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('mc');

        // Paste number not recognised by binLookup
        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste');

        // Brand property in the PM data should be reset
        await t.expect(getPropFromPMData('brand')).eql(undefined);

        await t
            // visa card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('visa');
    }
);

test(
    'Fill in regular MC card then ' +
        'check that a brand has been set on PM data, then' +
        'delete digits and , ' +
        'check that the brand has been reset on paymentMethod data ',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD); // mc

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('mc');

        // Delete number
        await cardUtils.deleteCardNumber(t);

        // Brand property in the PM data should be reset
        await t.expect(getPropFromPMData('brand')).eql(undefined);

        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('card');
    }
);

/**
 * DUAL BRANDING RESETS (similar to those done in bancontact.dualbranding.reset.test, but applied to the regular card component, in Dropin)
 */
test(
    'Fill in dual branded card then ' +
        'check no sorting has occurred to place bcmc first, then' +
        'ensure only generic card logo shows after deleting digits',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        // Maestro first, Bcmc second
        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        await cardUtils.deleteCardNumber(t);

        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('card');
    }
);

test(
    'Fill in dual branded card then ' +
        'select bcmc then' +
        'ensure cvc field is hidden' +
        'ensure only generic card logo shows after deleting digits and ' +
        'that the brand has been reset on paymentMethod data ' +
        ' and the cvc field is visble again',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        // Click BCMC brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('bcmc');

        // Hidden cvc field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await cardUtils.deleteCardNumber(t);

        await t
            // generic card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('card');

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);

        // Visible cvc field
        await t.expect(cvcSpan.filterVisible().exists).ok();
    }
);

test(
    'Fill in dual branded card then ' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa) ' +
        'ensure that Visa logo shows',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        await t
            // visa card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('visa');
    }
);

test(
    'Fill in dual branded card then ' +
        'select maestro then ' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that visa logo shows',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('maestro')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('bcmc');

        // Click Maestro brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(0));

        // Hidden cvc field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('visa');

        // Visible cvc field
        await t.expect(cvcSpan.filterVisible().exists).ok();
    }
);
