import { Selector, ClientFunction } from 'testcafe';

import { start } from '../commonUtils';

import { fillCardNumber, fillDateAndCVC } from './cardUtils';

import { DUAL_BRANDED_CARD } from '../constants';

const dualBrandingIconHolder = Selector('.card-field .adyen-checkout__card__dual-branding__buttons--active');

const getCardIsValid = ClientFunction(() => {
    return window.card.isValid;
});

const getPropFromPMData = ClientFunction(prop => {
    return window.card.formatData().paymentMethod[prop];
});

//const getCardState = ClientFunction((what, prop) => {
//    return window.card.state[what][prop];
//});

const TEST_SPEED = 1;

/**
 * NOTE: For tests to work with a config file the playground file needs to look for the window.cardConfigObj that the config file creates
 * e.g.
 *  window.card = checkout
 *      .create('card', window.cardConfigObj || {
 *          type: 'scheme',
 *          brands ...
 */
fixture`Testing dual branding`.page`http://localhost:3020/cards/`.clientScripts('config/dualBranding.js');

test('Fill in card number that will get dual branding result from binLookup, ' + 'then check that the expected icons/buttons are shown', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Fill card field with dual branded card (visa/cb)
    await fillCardNumber(t, DUAL_BRANDED_CARD);

    await t
        .expect(dualBrandingIconHolder.exists)
        .ok()
        .expect(
            dualBrandingIconHolder
                .find('img')
                .nth(0)
                .getAttribute('data-value')
        )
        .eql('visa')
        .expect(
            dualBrandingIconHolder
                .find('img')
                .nth(1)
                .getAttribute('data-value')
        )
        .eql('cartebancaire');
});

test(
    'Fill in card number that will get dual branding result from binLookup, ' +
        'then complete card without selecting dual brand,' +
        'then check PM data does not have a brand property',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await fillCardNumber(t, DUAL_BRANDED_CARD);

        await fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // Should not be a brand property in the PM data
        await t.expect(getPropFromPMData('brand')).eql(undefined);
    }
);

test(
    'Fill in card number that will get dual branding result from binLookup, ' +
        'then complete card & select the dual brands,' +
        'then check PM data does have a corresponding brand property',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with dual branded card (visa/cb)
        await fillCardNumber(t, DUAL_BRANDED_CARD);

        await fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // Click brand icons
        await t
            .click(dualBrandingIconHolder.find('img').nth(1))
            .expect(getPropFromPMData('brand'))
            .eql('cartebancaire')
            .wait(1000)
            .click(dualBrandingIconHolder.find('img').nth(0))
            .expect(getPropFromPMData('brand'))
            .eql('visa');
    }
);
