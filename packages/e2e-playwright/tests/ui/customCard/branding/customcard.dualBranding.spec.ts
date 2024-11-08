import { test } from '@playwright/test';

const singleBrandingIconHolder = '.secured-fields .pm-image';
const dualBrandingIconHolder = '.secured-fields .pm-image-dual';

const getPropFromPMData = prop => {
    return globalThis.securedFields.formatData().paymentMethod[prop];
};

test.describe('Testing dual branding in custom card', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(CUSTOMCARDS_URL);
        // use 'customcard.dualBranding.clientScripts.js';
    });

    test(
        'Fill in card number that will get dual branding result from binLookup, ' + 'then check that the expected icons/buttons are shown',
        async () => {
            // Start, allow time for iframes to load
            // await start(t, 2000, TEST_SPEED);
            //
            // await t
            //   // default generic card logo
            //   .expect(singleBrandingIconHolder.find('img').nth(0).getAttribute('alt'))
            //   .eql('card');
            //
            // // Fill card field with dual branded card (visa/cb)
            // await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);
            //
            // await t
            //   // hidden single brand icon holder
            //   .expect(singleBrandingIconHolder.filterHidden().exists)
            //   .ok()
            //   // visible dual brand icon holder
            //   .expect(dualBrandingIconHolder.filterVisible().exists)
            //   .ok()
            //   // with expected brand icons
            //   .expect(dualBrandingIconHolder.find('img').nth(0).getAttribute('alt'))
            //   .eql('visa')
            //   .expect(dualBrandingIconHolder.find('img').nth(1).getAttribute('alt'))
            //   .eql('cartebancaire');
        }
    );

    test(
        'Fill in card number that will get dual branding result from binLookup, ' +
            'then complete card without selecting dual brand,' +
            'then check it is valid,' +
            'then check PM data does not have a brand property',
        async () => {
            // Start, allow time for iframes to load
            // await start(t, 2000, TEST_SPEED);
            //
            // // Fill card field with dual branded card (visa/cb)
            // await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);
            //
            // await cardUtils.fillDateAndCVC(t);
            //
            // // Expect card to now be valid
            // await t.expect(getIsValid('securedFields')).eql(true);
            //
            // // Should not be a brand property in the PM data
            // await t.expect(getPropFromPMData('brand')).eql(undefined);
        }
    );

    test(
        'Fill in card number that will get dual branding result from binLookup, ' +
            'then complete card,' +
            'then check it is valid,' +
            'then select the dual brands,' +
            'then check PM data does have a corresponding brand property',
        async () => {
            // Start, allow time for iframes to load
            // await start(t, 2000, TEST_SPEED);
            //
            // // Fill card field with dual branded card (visa/cb)
            // await cardUtils.fillCardNumber(t, DUAL_BRANDED_CARD);
            //
            // await cardUtils.fillDateAndCVC(t);
            //
            // // Expect card to now be valid
            // await t.expect(getIsValid('securedFields')).eql(true);
            //
            // // Click brand icons
            // await t
            //   .click(dualBrandingIconHolder.find('img').nth(0))
            //   .expect(getPropFromPMData('brand'))
            //   .eql('visa')
            //   .wait(1000)
            //   .click(dualBrandingIconHolder.find('img').nth(1))
            //   .expect(getPropFromPMData('brand'))
            //   .eql('cartebancaire');
        }
    );
});
