import cu from '../utils/cardUtils';
import { ClientFunction, Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import { BASE_URL } from '../../pages';
import { BCMC_CARD, UNKNOWN_VISA_CARD } from '../utils/constants';

const cvcSpan = Selector('.adyen-checkout__dropin .adyen-checkout__field__cvc');

const brandingIcon = Selector('.adyen-checkout__dropin .adyen-checkout__card__cardNumber__brandIcon');
const dualBrandingIconHolderActive = Selector('.adyen-checkout__payment-method--bcmc .adyen-checkout__card__dual-branding__buttons--active');

const getPropFromPMData = ClientFunction(prop => {
    return window.dropin.dropinRef.state.activePaymentMethod.formatData().paymentMethod[prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--bcmc iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing Bancontact, with dual branded cards, in Dropin, resetting after failed binLookup`
    .page(BASE_URL + '?countryCode=BE')
    .clientScripts('bancontact.clientScripts.js');

test(
    'Fill in dual branded card then ' +
        'check that brands have been sorted to place Bcmc first then ' +
        'ensure only bcmc logo shows after deleting digits',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        // Bcmc first, Maestro second
        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('maestro');

        // TODO delete action fails in Safari - but only if the "Click BCMC brand icon" action takes place!?
        await cardUtils.deleteCardNumber(t);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .notOk()
            // single bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');
    }
);

test(
    'Fill in dual branded card then ' +
        'select bcmc, as first item (brand sorting has occurred), then' +
        'ensure only bcmc logo shows after deleting digits and ' +
        'that the brand has been reset on paymentMethod data',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('maestro');

        // Click BCMC brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(0));

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('bcmc');

        // TODO delete action fails in Safari
        await cardUtils.deleteCardNumber(t);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .notOk()
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);
    }
);

test(
    'Fill in dual branded card then ' +
        'select maestro then' +
        'ensure cvc field is hidden even though it is maestro (brand sorting has occurred)' +
        'ensure only bcmc logo shows after deleting digits and ' +
        'that the brand has been reset on paymentMethod data',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('maestro');

        // Click Maestro brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Should be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql('maestro');

        // Hidden cvc field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        // TODO delete action fails in Safari - but only if the "Click BCMC brand icon" action takes place
        await cardUtils.deleteCardNumber(t);

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);
    }
);

test(
    'Fill in dual branded card then ' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that bcmc logo shows',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('maestro');

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');
    }
);

test(
    'Fill in dual branded card then ' +
        'select maestro then' +
        'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
        'ensure that bcmc logo shows',
    async t => {
        // Start, allow time to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value'))
            .eql('bcmc')
            .expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value'))
            .eql('maestro');

        // Click Maestro brand icon
        await t.click(dualBrandingIconHolderActive.find('img').nth(1));

        // Hidden cvc field
        await t.expect(cvcSpan.filterHidden().exists).ok();

        await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup

        await t
            // bcmc card icon
            .expect(brandingIcon.getAttribute('alt'))
            .contains('bcmc');

        await t.wait(2000);
    }
);
