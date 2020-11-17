import { Selector, ClientFunction } from 'testcafe';

import { start } from '../commonUtils';

import { fillCardNumber, fillDateAndCVC } from './kcpUtils';

import { DUAL_BRANDED_CARD } from '../constants';

const dualBrandingIconHolder = Selector('.card-field .adyen-checkout__card__dual-branding__buttons--active');

const getCardIsValid = ClientFunction(() => {
    return window.card.isValid;
});

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

fixture`Testing dual branding`.page`http://localhost:3020/cards/?testing=testcafe`;

// Green 1
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
