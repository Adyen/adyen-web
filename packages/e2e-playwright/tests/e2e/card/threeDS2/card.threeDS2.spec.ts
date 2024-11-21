import { expect, test } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import {
    PAYMENT_RESULT,
    TEST_CVC_VALUE,
    TEST_DATE_VALUE,
    THREEDS2_CHALLENGE_ONLY_CARD,
    THREEDS2_CHALLENGE_PASSWORD,
    THREEDS2_FRICTIONLESS_CARD,
    THREEDS2_FULL_FLOW_CARD
} from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';

test.describe('Card with 3DS2', () => {
    test.describe('Different 3DS2 flows', () => {
        test('should handle frictionless flow', async ({ page, card }) => {
            const submitFingerprintResponsePromise = page.waitForResponse(response => response.url().includes('/submitThreeDS2Fingerprint'));

            // Frictionless flow seems to work only with Advanced flow
            await card.goto(URL_MAP.cardWithAdvancedFlow);

            await card.typeCardNumber(THREEDS2_FRICTIONLESS_CARD);
            await card.typeCvc(TEST_CVC_VALUE);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.pay();

            const fingerPrintResponse = await submitFingerprintResponsePromise;

            await expect(card.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            expect(fingerPrintResponse.status()).toBe(200);
        });

        test('should handle full flow (fingerprint & challenge)', async ({ page, card }) => {
            const submitFingerprintResponsePromise = page.waitForResponse(response => response.url().includes('/submitThreeDS2Fingerprint'));

            await card.goto(URL_MAP.card);

            await card.typeCardNumber(THREEDS2_FULL_FLOW_CARD);
            await card.typeCvc(TEST_CVC_VALUE);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.pay();

            await card.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
            await card.threeDs2Challenge.submit();

            const fingerPrintResponse = await submitFingerprintResponsePromise;

            await expect(card.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            expect(fingerPrintResponse.status()).toBe(200);
        });

        test('should handle challenge-only flow', async ({ page, card }) => {
            let submitFingerprintRequestWasMade = false;

            page.on('request', request => {
                if (request.url().includes('/submitThreeDS2Fingerprint')) submitFingerprintRequestWasMade = true;
            });

            await card.goto(URL_MAP.card);

            await card.typeCardNumber(THREEDS2_CHALLENGE_ONLY_CARD);
            await card.typeCvc(TEST_CVC_VALUE);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.pay();

            await card.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
            await card.threeDs2Challenge.submit();

            await expect(card.paymentResult).toContainText(PAYMENT_RESULT.authorised);
            await expect(submitFingerprintRequestWasMade).toBeFalsy();
        });
    });

    test.describe('Different 3DS2 challenge window sizes', () => {
        test('should use the default window size', async ({ card }) => {
            await card.goto(URL_MAP.card);

            await card.typeCardNumber(THREEDS2_CHALLENGE_ONLY_CARD);
            await card.typeCvc(TEST_CVC_VALUE);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.pay();

            const { width, height } = await card.threeDs2Challenge.getIframeSize();

            expect(width).toBe(390);
            expect(height).toBe(400);
        });

        test('should be possible to use a custom window size', async ({ card }) => {
            await card.goto(
                getStoryUrl({
                    baseUrl: URL_MAP.card,
                    componentConfig: {
                        challengeWindowSize: '04'
                    }
                })
            );

            await card.typeCardNumber(THREEDS2_CHALLENGE_ONLY_CARD);
            await card.typeCvc(TEST_CVC_VALUE);
            await card.typeExpiryDate(TEST_DATE_VALUE);
            await card.pay();

            const { width, height } = await card.threeDs2Challenge.getIframeSize();

            expect(width).toBe(600);
            expect(height).toBe(400);
        });
    });
});
