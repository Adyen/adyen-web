import { test, expect } from '../../../fixtures/card.fixture';
import { THREEDS2_MAESTRO_CARD, PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, VISA_CARD } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { paymentSuccessfulMock } from '../../../mocks/payments/payments.mock';
import { getStoryUrl } from '../../utils/getStoryUrl';

test.describe('Card - Fastlane Sign up', () => {
    test.describe('when Fastlane SDK returns "showConsent: true"', () => {
        test('#1 should shown consent UI only when Mastercard or Visa number is entered', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithFastlane.goto(URL_MAP.cardWithFastlane);
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            // Start typing VISA card
            await cardWithFastlane.typeCardNumber('4111');
            await expect(cardWithFastlane.fastlaneElement).toBeVisible();

            await cardWithFastlane.deleteCardNumber();
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            // Start typing MC card
            await cardWithFastlane.typeCardNumber('5454');
            await expect(cardWithFastlane.fastlaneElement).toBeVisible();

            await cardWithFastlane.deleteCardNumber();
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            // Enter brand not supported by fastlame (MAESTRO)
            await cardWithFastlane.typeCardNumber(THREEDS2_MAESTRO_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeDefined();

            expect(JSON.parse(atob(paymentMethod.fastlaneData))).toEqual({
                consentShown: true,
                consentVersion: 'v1',
                consentGiven: false,
                fastlaneSessionId: 'ABC-123'
            });

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#2 should send consentGiven:true even if the mobile number input is empty', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithFastlane.goto(URL_MAP.cardWithFastlane);
            await cardWithFastlane.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);
            await expect(cardWithFastlane.fastlaneElement).toBeVisible();

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeDefined();

            expect(JSON.parse(atob(paymentMethod.fastlaneData))).toEqual({
                consentShown: true,
                consentGiven: true,
                consentVersion: 'v1',
                fastlaneSessionId: 'ABC-123'
            });

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#3 should send fastlane data even if the consent UI is not displayed at all', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithFastlane.goto(URL_MAP.cardWithFastlane);
            await cardWithFastlane.typeCardNumber(THREEDS2_MAESTRO_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeDefined();

            expect(JSON.parse(atob(paymentMethod.fastlaneData))).toEqual({
                consentShown: false,
                consentGiven: false,
                consentVersion: 'v1',
                fastlaneSessionId: 'ABC-123'
            });

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#4 should sign up passing the mobile number', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithFastlane.goto(URL_MAP.cardWithFastlane);
            await cardWithFastlane.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);

            const telephoneNumber = '8001005000';
            await cardWithFastlane.typeMobileNumber(telephoneNumber);

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeDefined();

            expect(JSON.parse(atob(paymentMethod.fastlaneData))).toEqual({
                consentShown: true,
                consentGiven: true,
                consentVersion: 'v1',
                fastlaneSessionId: 'ABC-123',
                telephoneNumber
            });

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('when Fastlane SDK returns "showConsent: false"', () => {
        test('#1 should send fastlaneData even though the sign up UI is not displayed', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithFastlane.goto(
                getStoryUrl({
                    baseUrl: URL_MAP.cardWithFastlane,
                    componentConfig: {
                        fastlaneConfiguration: {
                            showConsent: false,
                            fastlaneSessionId: 'ABC-123',
                            defaultToggleState: undefined,
                            termsAndConditionsLink: undefined,
                            privacyPolicyLink: undefined,
                            termsAndConditionsVersion: undefined
                        }
                    }
                })
            );

            await cardWithFastlane.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);

            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeDefined();

            expect(JSON.parse(atob(paymentMethod.fastlaneData))).toEqual({
                consentShown: false,
                consentGiven: false,
                fastlaneSessionId: 'ABC-123'
            });

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('when Fastlane configuration is not passed to the Card component', () => {
        test('#1 should not add fastlaneData to the payments request', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            await cardWithFastlane.goto(
                getStoryUrl({
                    baseUrl: URL_MAP.cardWithFastlane,
                    componentConfig: {}
                })
            );

            await cardWithFastlane.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);

            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeUndefined();

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('#2 should not show Fastlane signup interface for the supported brands', async ({ cardWithFastlane, page }) => {
            await cardWithFastlane.goto(
                getStoryUrl({
                    baseUrl: URL_MAP.cardWithFastlane,
                    componentConfig: {}
                })
            );

            await cardWithFastlane.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            await cardWithFastlane.deleteCardNumber();

            await cardWithFastlane.typeCardNumber(VISA_CARD);
            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();
        });
    });

    test.describe('when Fastlane configuration object is not valid', () => {
        test('#1 should not add fastlaneData to the payments request', async ({ cardWithFastlane, page }) => {
            await paymentSuccessfulMock(page);
            const paymentsRequestPromise = page.waitForRequest(request => request.url().includes('/payments') && request.method() === 'POST');

            // Omitted 'showConsent' and 'defaultToggleState'
            await cardWithFastlane.goto(
                getStoryUrl({
                    baseUrl: URL_MAP.cardWithFastlane,
                    componentConfig: {
                        fastlaneConfiguration: {
                            termsAndConditionsLink: 'https://adyen.com',
                            privacyPolicyLink: 'https://adyen.com',
                            termsAndConditionsVersion: 'v1',
                            fastlaneSessionId: 'ABC-123'
                        }
                    }
                })
            );

            await cardWithFastlane.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithFastlane.typeCvc(TEST_CVC_VALUE);
            await cardWithFastlane.typeExpiryDate(TEST_DATE_VALUE);

            await expect(cardWithFastlane.fastlaneElement).not.toBeVisible();

            await cardWithFastlane.pay();

            const request = await paymentsRequestPromise;
            const paymentMethod = await request.postDataJSON().paymentMethod;
            expect(paymentMethod.fastlaneData).toBeUndefined();

            await expect(cardWithFastlane.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });
});
