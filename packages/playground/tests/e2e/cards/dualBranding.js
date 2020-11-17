import { Selector, ClientFunction } from 'testcafe';

import { start } from '../commonUtils';

import { fillCardNumber, fillDateAndCVC } from './kcpUtils';

import { DUAL_BRANDED_CARD } from '../constants';

const dualBrandingIconHolder = Selector('.card-field .adyen-checkout__card__dual-branding__buttons--active');

const getCardIsValid = ClientFunction(() => {
    return window.card.isValid;
});

const getBrandFromPMData = ClientFunction(() => {
    return window.card.formatData().paymentMethod.brand;
});

//const getCardState = ClientFunction((what, prop) => {
//    return window.card.state[what][prop];
//});

fixture`Testing dual branding`.page`http://localhost:3020/cards/?testing=testcafe`;

test('Fill in card number that will get dual branding result from binLookup, ' + 'then check that the expected icons/buttons are shown', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, 0.85);

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
        await start(t, 2000, 0.85);

        // Fill card field with dual branded card (visa/cb)
        await fillCardNumber(t, DUAL_BRANDED_CARD);

        await fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        await t.expect(getBrandFromPMData()).notOk();
    }
);

test(
    'Fill in card number that will get dual branding result from binLookup, ' +
        'then complete card & select the dual brands,' +
        'then check PM data does have a corresponding brand property',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, 0.85);

        // Fill card field with dual branded card (visa/cb)
        await fillCardNumber(t, DUAL_BRANDED_CARD);

        await fillDateAndCVC(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // Click brand icons
        await t
            .click(dualBrandingIconHolder.find('img').nth(1))
            .expect(getBrandFromPMData())
            .eql('cartebancaire')
            .click(dualBrandingIconHolder.find('img').nth(0))
            .expect(getBrandFromPMData())
            .eql('visa');
    }
);
