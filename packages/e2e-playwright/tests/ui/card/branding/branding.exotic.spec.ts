import { test } from '@playwright/test';

test.describe('Testing card component dedicated to a single, "exotic", txVariant that we don\'t recognise internally but that is recognised by /binLookup', () => {
    // use the config:
    // window.cardConfig = {
    //     type: 'scheme',
    //     brands: ['korean_local_card']
    // };

    test('Input details for "exotic" brand - card should still become valid, with no errors', async t => {
        // Wait for Card to load
        // cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
        // Blur the card number input field
        // Expect no errors Selector('.adyen-checkout__field--error') not exists
        // Fill in date cardUtils.fillDate(t, TEST_DATE_VALUE);
        // Fill cardUtils.fillCVC(t, TEST_CVC_VALUE);
        // Expect the card is valid
    });
});
