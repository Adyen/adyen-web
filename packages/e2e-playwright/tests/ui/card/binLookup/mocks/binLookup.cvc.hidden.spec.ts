import { test } from '@playwright/test';

const cvcSpan = '.card-field .adyen-checkout__field__cvc';
const optionalCVCSpan = '.card-field .adyen-checkout__field__cvc--optional';
const cvcLabel = '.card-field .adyen-checkout__label__text';
const brandingIcon = '.card-field .adyen-checkout__card__cardNumber__brandIcon';
const iframeSelector = '.card-field iframe';

test.describe('Testing a card for a response that should indicate hidden cvc', () => {
    // Use config from: binLookup.mocks.clientScripts.js
    test(
        'Test card has hidden cvc field ' + 'then complete date and see card is valid ' + ' then delete card number and see card reset',
        async () => {
            // Start, allow time for iframes to load
            // Expect generic card icon: expect(brandingIcon.getAttribute('src')).contains('nocard.svg')
            // Expect visible cvc field: expect(cvcSpan.filterVisible().exists)
            // Expect with regular text: expect(cvcLabel.withExactText('Security code').exists)
            // Expect not optional: expect(optionalCVCSpan.exists).notOk();
            // Fill in Unknown card: cardUtils.fillCardNumber(t, BCMC_CARD);
            // Expect bcmc card icon: expect(brandingIcon.getAttribute('src')).contains('bcmc.svg')
            // Expect hidden cvc field: expect(cvcSpan.filterHidden().exists)
            // Fill date: cardUtils.fillDate(t);
            // Expect card is valid: t.expect(getIsValid('card')).eql(true);
            // Delete number: cardUtils.deleteCardNumber(t);
            // Expect generic card icon: expect(brandingIcon.getAttribute('src')).contains('nocard.svg')
            // Expect visible cvc field: expect(cvcSpan.filterVisible().exists)
            // Expect with regular text: expect(cvcLabel.withExactText('Security code').exists)
            // Expect not optional: expect(optionalCVCSpan.exists).notOk();
            // Expect card is not valid: t.expect(getIsValid('card')).eql(false);
        }
    );
});
