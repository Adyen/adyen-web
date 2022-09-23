import { Selector, ClientFunction } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../utils/commonUtils';
import cu from '../utils/cardUtils';
import { DUAL_BRANDED_CARD, REGULAR_TEST_CARD, DUAL_BRANDED_CARD_EXCLUDED } from '../utils/constants';
import { BASE_URL } from '../../pages';

const dualBrandingIconHolder = Selector('.adyen-checkout__payment-method--card .adyen-checkout__card__dual-branding__buttons');
const dualBrandingIconHolderActive = Selector('.adyen-checkout__payment-method--card .adyen-checkout__card__dual-branding__buttons--active');

const NOT_SELECTED_CLASS = 'adyen-checkout__card__cardNumber__brandIcon--not-selected';

const getPropFromPMData = ClientFunction(prop => {
    return window.dropin.dropinRef.state.activePaymentMethod.formatData().paymentMethod[prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.adyen-checkout__payment-method--card iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing dual branding in dropin`.page(BASE_URL).clientScripts('dualBranding.clientScripts.js');

test(
    '#1 Fill in card number that will get dual branding result from binLookup, ' + 'then check that the expected icons/buttons are shown',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await t
            .expect(dualBrandingIconHolderActive.exists)
            .ok()
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .getAttribute('data-value')
            )
            .eql('visa')
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .getAttribute('data-value')
            )
            .eql('cartebancaire');
    }
);

test(
    '#2 Fill in card number that will get dual branding result from binLookup, ' +
        'then complete card without selecting dual brand,' +
        'then check it is valid,' +
        'then check PM data does not have a brand property',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getIsValid('dropin')).eql(true);

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);
    }
);

test(
    '#3 Fill in card number that will get dual branding result from binLookup, ' +
        'then complete card,' +
        'then check it is valid,' +
        'then select the dual brands,' +
        'then check PM data does have a corresponding brand property',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        await cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getIsValid('dropin')).eql(true);

        // Click brand icons
        await t
            .click(dualBrandingIconHolderActive.find('img').nth(1))
            .expect(getPropFromPMData('brand'))
            .eql('cartebancaire')
            .wait(1000)
            .click(dualBrandingIconHolderActive.find('img').nth(0))
            .expect(getPropFromPMData('brand'))
            .eql('visa');
    }
);

test(
    '#4 Fill in partial card number that will get dual branding result from binLookup, ' +
        'then check that the expected icons/buttons are shown but inactive,' +
        'then complete the number & check that the icons/buttons are active',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        const firstDigits = DUAL_BRANDED_CARD.substring(0, 11);
        const lastDigits = DUAL_BRANDED_CARD.substring(11, 16);

        // Partially fill card field with dual branded card (visa/cb)
        await cardUtils.fillCardNumber(t, firstDigits);

        await t
            .expect(dualBrandingIconHolder.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.exists)
            .notOk();

        await t.wait(500);

        // Complete field
        await cardUtils.fillCardNumber(t, lastDigits);

        await t.expect(dualBrandingIconHolderActive.exists).ok();
    }
);

test(
    '#5 Fill in card number that will get dual branding result from binLookup, ' +
        'then select one of the dual brands,' +
        'then check the other brand icon is at reduced alpha,' +
        'then repeat with the other icon',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);

        // Click brand icons
        await t
            // click first icon
            .click(dualBrandingIconHolderActive.find('img').nth(0))
            // first icon shouldn't have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // second icon should have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(true)
            // click second icon
            .click(dualBrandingIconHolderActive.find('img').nth(1))
            // second icon shouldn't have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // first icon should have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(true);
    }
);

test(
    '#6 Fill in card number that will get single branding result from binLookup, ' +
        'then enter a dual branded card number,' +
        'check both brand icons are at full alpha,' +
        'then click icons and make sure they go to the expected alpha',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

        // Paste dual branded card (visa/cb) into card field
        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD, 'paste');

        // Check buttons are active
        await t.expect(dualBrandingIconHolderActive.exists).ok();

        // Check icon opacities (should be 100%)
        await t
            // first icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // second icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false);

        // Click brand icons
        await t
            // click first icon
            .click(dualBrandingIconHolderActive.find('img').nth(0))
            // first icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // second icon SHOULD have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(true)
            // click second icon
            .click(dualBrandingIconHolderActive.find('img').nth(1))
            // second icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // first icon SHOULD have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(true);
    }
);

test(
    '#7 Fill in card number that will get single branding result from binLookup, ' +
        'then enter a partial dual branded card number,' +
        'check both brand icons are at reduced alpha,' +
        'complete card number,' +
        'check both brand icons are at full alpha,' +
        'then click icons and make sure they go to the expected alpha',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);

        const firstDigits = DUAL_BRANDED_CARD.substring(0, 11);
        const lastDigits = DUAL_BRANDED_CARD.substring(11, 16);

        // Paste partial dual branded card (visa/cb) into card field
        await cardUtils.fillCardNumber(t, firstDigits, 'paste');

        // Check buttons are present but NOT active (which will mean the holding element is at 25% opacity)
        await t
            .expect(dualBrandingIconHolder.exists)
            .ok()
            .expect(dualBrandingIconHolderActive.exists)
            .notOk();

        // Complete field
        await cardUtils.fillCardNumber(t, lastDigits);

        // Check buttons are active
        await t.expect(dualBrandingIconHolderActive.exists).ok();

        // Check icon opacities (should be 100%)
        await t
            // first icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // second icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false);

        // Click brand icons
        await t
            // click first icon
            .click(dualBrandingIconHolderActive.find('img').nth(0))
            // first icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // second icon SHOULD have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(true)
            // click second icon
            .click(dualBrandingIconHolderActive.find('img').nth(1))
            // second icon SHOULDN'T have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(1)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(false)
            // first icon SHOULD have the "not selected" class
            .expect(
                dualBrandingIconHolderActive
                    .find('img')
                    .nth(0)
                    .hasClass(NOT_SELECTED_CLASS)
            )
            .eql(true);
    }
);

test(
    '#8 Fill in card number that will get dual branding result from binLookup, ' +
        'but one of the brands should be excluded from the UI, ' +
        '(but meaning also that no brand should be set in the PM data), ' +
        'then check it is valid,' +
        'then check PM data does not have a brand property',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD_EXCLUDED);

        await cardUtils.fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getIsValid('dropin')).eql(true);

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);
    }
);
