import { test } from '../../../../fixtures/base-fixture';

const singleBrandingIconHolder = '.secured-fields .pm-image';
const dualBrandingIconHolder = '.secured-fields .pm-image-dual';

const getPropFromPMData = prop => {
    return globalThis.securedFields.formatData().paymentMethod[prop];
};

const iframe = '.secured-fields iframe';

test.describe('Testing single branding resets in custom card', () => {
    test.beforeEach(async () => {
        // await t.navigateTo(CUSTOMCARDS_URL);
        // use customcard.dualBranding.clientScripts.js
    });
    test(
        'Fill in regular MC card then ' +
            'check brand logo is shown, then ' +
            'check that a brand has been set on PM data, then' +
            'paste in a card unrecognised by binLookup, ' +
            'check that the brand has been reset on paymentMethod data and ' +
            'that the internal regex have recognised the unrecognised card as Visa',
        async () => {
            // Start, allow time to load
            // await start(t, 2000, TEST_SPEED);
            //
            // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
            //
            // // mc logo shown
            // await t
            //     // visible single brand icon holder
            //     .expect(singleBrandingIconHolder.filterVisible().exists)
            //     .ok()
            //     // hidden dual brand icon holder
            //     .expect(dualBrandingIconHolder.filterHidden().exists)
            //     .ok()
            //     .expect(singleBrandingIconHolder.find('img').nth(0).getAttribute('alt'))
            //     .eql('mc');
            //
            // // Should be a brand property in the PM data
            // await t.expect(getPropFromPMData('brand')).eql('mc');
            //
            // await cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup
            //
            // // Should not be a brand property in the PM data
            // await t.expect(getPropFromPMData('brand')).eql(undefined);
            //
            // // visa card icon (internal regex has run)
            // await t.expect(singleBrandingIconHolder.find('img').nth(0).getAttribute('alt')).eql('visa');
        }
    );

    test(
        'Fill in regular MC card then ' +
            'check that a brand has been set on PM data, then ' +
            'delete digits and , ' +
            'check that the brand has been reset on paymentMethod data ' +
            'and the generic card icon is shown',
        async () => {
            // Start, allow time to load
            // await start(t, 2000, TEST_SPEED);
            //
            // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
            //
            // // mc logo shown
            // await t
            //     // visible single brand icon holder
            //     .expect(singleBrandingIconHolder.filterVisible().exists)
            //     .ok()
            //     // hidden dual brand icon holder
            //     .expect(dualBrandingIconHolder.filterHidden().exists)
            //     .ok()
            //     .expect(singleBrandingIconHolder.find('img').nth(0).getAttribute('alt'))
            //     .eql('mc');
            //
            // // Should be a brand property in the PM data
            // await t.expect(getPropFromPMData('brand')).eql('mc');
            //
            // // Delete number
            // await cardUtils.deleteCardNumber(t);
            //
            // // Brand property in the PM data should be reset
            // await t.expect(getPropFromPMData('brand')).eql(undefined);
            //
            // // Generic card icon
            // await t.expect(singleBrandingIconHolder.find('img').nth(0).getAttribute('alt')).eql('card');
        }
    );
});
