import { test } from '@playwright/test';

// @ts-ignore
const getPropFromPMData = prop => window.dropin.dropinRef.state.activePaymentMethod.formatData().paymentMethod[prop];

test.describe('Testing Card component, in Dropin, resetting brand after failed binLookup', () => {
    // use the config:
    // window.cardConfig = {
    //   type: 'scheme',
    //   brands: ['mc', 'visa', 'amex', 'cartebancaire']
    // };
    //
    // window.dropinConfig = {
    //   showStoredPaymentMethods: false, // hide stored PMs so credit card is first on list
    //   paymentMethodsConfiguration: {
    //     card: { brands: ['mc', 'amex', 'visa', 'cartebancaire', 'bcmc', 'maestro'], _disableClickToPay: true }
    //   }
    // };
    //
    // window.mainConfiguration = {
    //   removePaymentMethods: ['paywithgoogle', 'applepay', 'clicktopay']
    // };

    test(
        '#1 Fill in regular MC card then ' +
            'check that a brand has been set on PM data, then' +
            'paste in a card unrecognised by binLookup, ' +
            'check that the brand has been reset on paymentMethod data and ' +
            'that the internal regex have recognised the unrecognised card as Visa',
        async () => {
            // Start, allow time to load
            // await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD); // mc
            // await t.expect(getPropFromPMData('brand')).eql('mc');
            // Paste number not recognised by binLookup: paste into card number field UNKNOWN_VISA_CARD;
            // Brand property in the PM data should be reset: t.expect(getPropFromPMData('brand')).eql(undefined);
            // expect visa card icon
        }
    );

    test(
        '#2 Fill in regular MC card then ' +
            'check that a brand has been set on PM data, then' +
            'delete digits and , ' +
            'check that the brand has been reset on paymentMethod data ',
        async () => {
            // Start, allow time to load
            // card.fillCardNumber(t, REGULAR_TEST_CARD); // mc
            // Expect mc brand property in the PM data: expect(getPropFromPMData('brand')).eql('mc')
            // Delete number: cardUtils.deleteCardNumber(t);
            // Expect brand property in the PM data should be reset: expect(getPropFromPMData('brand')).eql(undefined);
            // Expect generic card icon: expect(brandingIcon.getAttribute('alt')).contains('card')
        }
    );

    /**
     * DUAL BRANDING RESETS (similar to those done in bancontact.dualbranding.reset.test, but applied to the regular card component, in Dropin)
     */
    test(
        '#3 Fill in dual branded card then ' +
            'check no sorting has occurred to place bcmc first, then' +
            'ensure only generic card logo shows after deleting digits',
        async () => {
            // Start, allow time to load
            // cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro
            // Expect Maestro first, Bcmc second
            // expect(dualBrandingIconHolderActive.exists)
            // expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value')).eql('maestro')
            // expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value')).eql('bcmc');
            // await cardUtils.deleteCardNumber(t);
            // Expect generic card icon: expect(brandingIcon.getAttribute('alt')).contains('card')
        }
    );

    test(
        '#4 Fill in dual branded card then ' +
            'select bcmc then' +
            'ensure cvc field is hidden' +
            'ensure only generic card logo shows after deleting digits and ' +
            'that the brand has been reset on paymentMethod data ' +
            ' and the cvc field is visble again',
        async () => {
            // Start, allow time to load
            // cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro
            //expect(dualBrandingIconHolderActive.exists)
            //expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value')).eql('maestro')
            //expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value')).eql('bcmc');
            // Click BCMC brand icon: t.click(dualBrandingIconHolderActive.find('img').nth(1));
            // Expect a brand property in the PM data: expect(getPropFromPMData('brand')).eql('bcmc');
            // Expect hidden cvc field: expect(cvcSpan.filterHidden().exists).ok();
            // cardUtils.deleteCardNumber(t);
            // Expect generic card icon: expect(brandingIcon.getAttribute('alt')).contains('card');
            // Not expect a brand property in the PM data: t.expect(getPropFromPMData('brand')).eql(undefined);
            // Expect Visible cvc field: t.expect(cvcSpan.filterVisible().exists).ok();
        }
    );

    test(
        '#5 Fill in dual branded card then ' +
            'paste in number not recognised by binLookup (but that internally is recognised as Visa) ' +
            'ensure that Visa logo shows',
        async () => {
            // Start, allow time to load
            // cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro
            // Expect the logo, with the correct order
            //expect(dualBrandingIconHolderActive.exists)
            //expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value')).eql('maestro')
            //expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value')).eql('bcmc');
            // cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup
            // Expect visa card icon: expect(brandingIcon.getAttribute('alt')).contains('VISA');
        }
    );

    test(
        '#6 Fill in dual branded card then ' +
            'select maestro then ' +
            'paste in number not recognised by binLookup (but that internally is recognised as Visa)' +
            'ensure that visa logo shows',
        async () => {
            // Start, allow time to load
            // cardUtils.fillCardNumber(t, BCMC_CARD); // dual branded with maestro
            // Expect the logo, with the correct order
            //expect(dualBrandingIconHolderActive.exists)
            //expect(dualBrandingIconHolderActive.find('img').nth(0).getAttribute('data-value')).eql('maestro')
            //expect(dualBrandingIconHolderActive.find('img').nth(1).getAttribute('data-value')).eql('bcmc');
            // Click Maestro brand icon: t.click(dualBrandingIconHolderActive.find('img').nth(0));
            // Expect hidden cvc field: t.expect(cvcSpan.filterHidden().exists).ok();
            // cardUtils.fillCardNumber(t, UNKNOWN_VISA_CARD, 'paste'); // number not recognised by binLookup
            // Expect visa card icon: expect(brandingIcon.getAttribute('alt')).contains('VISA');
            // Expect visible cvc field: t.expect(cvcSpan.filterVisible().exists).ok();
        }
    );
});
