import { test } from '../../pages/cards/card.fixture';

test.describe('Card payments with KCP enabled feature', () => {
    test('should submit the korea issue card payment', async () => {
        // fill in KOREAN_TEST_CARD
        // expect to see the non-branded logo
        // fill in the required fields
        // click pay btn
        // expect to see success msg
    });

    test('should not submit the korea issue card payment', async () => {
        // fill in KOREAN_TEST_CARD
        // expect to see the non-branded logo
        // fill in partial fields
        // click pay btn
        // expect to see error msg
    });

    test('should submit the regular non-korean card payment', async () => {
        // fill in NON_KOREAN_TEST_CARD
        // expect to see the brand logo
        // fill in required fields
        // click pay btn
        // expect to see success msg
    });
});
