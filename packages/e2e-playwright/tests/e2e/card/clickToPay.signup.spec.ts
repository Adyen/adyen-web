import { test, expect } from '../../../fixtures/card.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../utils/getStoryUrl';
import { toHaveScreenshot } from '../../utils/assertions';
import { mastercardClickToPaySdkMock } from '../../../mocks/clickToPay/clickToPay.mock';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { dualBrandedBcmcAndMc } from '../../../mocks/binLookup/binLookup.data';
import {
    AMEX_CARD,
    BCMC_DUAL_BRANDED_MC,
    CLICK_TO_PAY_DPA_CONFIGURATION,
    CLICK_TO_PAY_SIGNUP_PHONE,
    MC_PULSE_DEBIT_CARD,
    REGULAR_TEST_CARD,
    SHOPPER_DATA,
    TAGS,
    THREEDS2_MAESTRO_CARD,
    VISA_CARD
} from '../../utils/constants';

const signupConfiguration = {
    configuration: { ...CLICK_TO_PAY_DPA_CONFIGURATION.mc },
    clickToPayConfiguration: { enableSignup: true }
};

const signupUrl = (componentConfig: object = signupConfiguration) => getStoryUrl({ baseUrl: URL_MAP.cardWithClickToPaySignup, componentConfig });

const DUAL_BRAND_CONFIGURATION = {
    ...signupConfiguration,
    brands: ['mc', 'visa', 'amex', 'maestro', 'bcmc']
};

test.describe('Card - Click to Pay sign up', () => {
    test.describe('when the shopper is not recognized by Click to Pay', () => {
        test.beforeEach(async ({ page }) => {
            await mastercardClickToPaySdkMock(page, { recognized: false });
        });

        test.describe('visibility by card brand', () => {
            test('#1 should show the sign up only once a Mastercard number is entered, and hide it when the number is deleted', async ({
                cardWithCtpSignup
            }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();

                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);
                await expect.poll(() => cardWithCtpSignup.getPaymentMethodBrand()).toBe('mc');
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeVisible();
                await expect(cardWithCtpSignup.signupConsentCheckbox).not.toBeChecked();
                await expect(cardWithCtpSignup.signupDetailsGroup).toBeHidden();

                await cardWithCtpSignup.deleteCardNumber();
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();
            });

            const ineligibleCards = [
                { brand: 'Visa', cardNumber: VISA_CARD, brandId: 'visa' },
                { brand: 'Maestro', cardNumber: THREEDS2_MAESTRO_CARD, brandId: 'maestro' },
                { brand: 'American Express', cardNumber: AMEX_CARD, brandId: 'amex' }
            ];

            for (const { brand, cardNumber, brandId } of ineligibleCards) {
                test(`#2 should not show the sign up for a ${brand} card`, async ({ cardWithCtpSignup }) => {
                    await cardWithCtpSignup.goto(signupUrl());

                    await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(cardNumber);
                    await expect.poll(() => cardWithCtpSignup.getPaymentMethodBrand()).toBe(brandId);
                    await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();
                });
            }

            test('#3 should show the sign up for a dual branded card only while Mastercard is the selected brand', async ({
                cardWithCtpSignup,
                page
            }) => {
                await binLookupMock(page, dualBrandedBcmcAndMc);
                await cardWithCtpSignup.goto(signupUrl(DUAL_BRAND_CONFIGURATION));

                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(BCMC_DUAL_BRANDED_MC);
                await expect(cardWithCtpSignup.dualBrandSelector).toBeVisible();

                // Bancontact comes first in the BIN lookup response, so it is selected by default
                await expect(cardWithCtpSignup.getBrandButton(/bancontact/i)).toHaveAttribute('aria-pressed', 'true');
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();

                await cardWithCtpSignup.selectBrand(/mastercard/i);
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeVisible();

                await cardWithCtpSignup.selectBrand(/bancontact/i);
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();
            });

            test('#4 should show the sign up for a Mastercard debit card co-branded with Pulse', async ({ cardWithCtpSignup }) => {
                // The BIN lookup only returns Pulse when it is one of the Card brands
                await cardWithCtpSignup.goto(signupUrl({ ...signupConfiguration, brands: ['mc', 'visa', 'pulse'] }));

                const binLookupResponse = await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(MC_PULSE_DEBIT_CARD);
                const supportedBrands = binLookupResponse.brands?.filter(({ supported }) => supported).map(({ brand }) => brand);
                expect(supportedBrands?.sort()).toEqual(['mc', 'pulse']);

                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeVisible();
                await cardWithCtpSignup.checkSignupConsent();
                await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({ storeClickToPayProfile: true });
            });
        });

        test.describe('visibility by merchant configuration', () => {
            const ineligibleConfigurations = [
                {
                    description: 'enableSignup is not set',
                    componentConfig: { configuration: { ...CLICK_TO_PAY_DPA_CONFIGURATION.mc }, clickToPayConfiguration: {} }
                },
                {
                    description: 'enableSignup is false',
                    componentConfig: { configuration: { ...CLICK_TO_PAY_DPA_CONFIGURATION.mc }, clickToPayConfiguration: { enableSignup: false } }
                },
                {
                    description: 'only the Visa Click to Pay configuration is provided',
                    componentConfig: { configuration: { ...CLICK_TO_PAY_DPA_CONFIGURATION.visa }, clickToPayConfiguration: { enableSignup: true } }
                },
                {
                    description: 'the funding source is prepaid',
                    componentConfig: { ...signupConfiguration, fundingSource: 'prepaid' }
                }
            ];

            for (const { description, componentConfig } of ineligibleConfigurations) {
                test(`should not show the sign up for a Mastercard card when ${description}`, async ({ cardWithCtpSignup }) => {
                    await cardWithCtpSignup.goto(signupUrl(componentConfig));

                    await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);
                    await expect.poll(() => cardWithCtpSignup.getPaymentMethodBrand()).toBe('mc');
                    await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();
                });
            }
        });

        test.describe('with the store details checkbox', () => {
            test('#1 should show the sign up below the store details checkbox when enableStoreDetails is true', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl({ ...signupConfiguration, enableStoreDetails: true }));

                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);
                await expect(cardWithCtpSignup.storeDetailsCheckbox).toBeVisible();
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeVisible();

                await expect
                    .poll(async () => {
                        const storeDetailsBox = await cardWithCtpSignup.storeDetailsCheckbox.boundingBox();
                        const signupBox = await cardWithCtpSignup.signupConsentCheckbox.boundingBox();
                        return storeDetailsBox !== null && signupBox !== null && signupBox.y > storeDetailsBox.y;
                    })
                    .toBe(true);
            });

            test('#2 should show the sign up when enableStoreDetails is false', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl({ ...signupConfiguration, enableStoreDetails: false }));

                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeVisible();
                await expect(cardWithCtpSignup.storeDetailsCheckbox).toBeHidden();
            });
        });

        test.describe('payment data', () => {
            test('#1 should add the consent and the typed details when the shopper signs up', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

                await cardWithCtpSignup.checkSignupConsent();
                await expect(cardWithCtpSignup.signupPhonePrefixInput).toHaveValue(CLICK_TO_PAY_SIGNUP_PHONE.defaultPrefix);

                await cardWithCtpSignup.fillSignupDetails({
                    firstName: SHOPPER_DATA.firstName,
                    lastName: SHOPPER_DATA.lastName,
                    shopperEmail: SHOPPER_DATA.email,
                    mobileNumber: CLICK_TO_PAY_SIGNUP_PHONE.typedNumber
                });

                await expect
                    .poll(() => cardWithCtpSignup.getClickToPaySignupPayload())
                    .toEqual({
                        storeClickToPayProfile: true,
                        shopperName: { firstName: SHOPPER_DATA.firstName, lastName: SHOPPER_DATA.lastName },
                        shopperEmail: SHOPPER_DATA.email,
                        telephoneNumber: `${CLICK_TO_PAY_SIGNUP_PHONE.defaultPrefix}${CLICK_TO_PAY_SIGNUP_PHONE.typedNumber}`
                    });
            });

            test('#2 should prefill the details from clickToPayConfiguration and add them when the shopper signs up', async ({
                cardWithCtpSignup
            }) => {
                await cardWithCtpSignup.goto(
                    signupUrl({
                        configuration: { ...CLICK_TO_PAY_DPA_CONFIGURATION.mc },
                        clickToPayConfiguration: {
                            enableSignup: true,
                            firstName: SHOPPER_DATA.firstName,
                            lastName: SHOPPER_DATA.lastName,
                            shopperEmail: SHOPPER_DATA.email,
                            telephoneNumber: CLICK_TO_PAY_SIGNUP_PHONE.prefilledTelephoneNumber
                        }
                    })
                );
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

                await cardWithCtpSignup.checkSignupConsent();

                await expect(cardWithCtpSignup.signupFirstNameInput).toHaveValue(SHOPPER_DATA.firstName);
                await expect(cardWithCtpSignup.signupLastNameInput).toHaveValue(SHOPPER_DATA.lastName);
                await expect(cardWithCtpSignup.signupEmailInput).toHaveValue(SHOPPER_DATA.email);
                await expect(cardWithCtpSignup.signupPhonePrefixInput).toHaveValue(CLICK_TO_PAY_SIGNUP_PHONE.prefilledPrefix);
                await expect(cardWithCtpSignup.signupMobileNumberInput).toHaveValue(CLICK_TO_PAY_SIGNUP_PHONE.prefilledNumber);

                await expect
                    .poll(() => cardWithCtpSignup.getClickToPaySignupPayload())
                    .toEqual({
                        storeClickToPayProfile: true,
                        shopperName: { firstName: SHOPPER_DATA.firstName, lastName: SHOPPER_DATA.lastName },
                        shopperEmail: SHOPPER_DATA.email,
                        telephoneNumber: CLICK_TO_PAY_SIGNUP_PHONE.prefilledTelephoneNumber
                    });
            });

            test('#3 should add only the consent when the shopper signs up with empty details', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

                await cardWithCtpSignup.checkSignupConsent();
                await expect(cardWithCtpSignup.signupDetailsGroup).toBeVisible();

                await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({ storeClickToPayProfile: true });
            });

            test('#4 should add only the details that were filled in', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

                await cardWithCtpSignup.checkSignupConsent();
                await expect(cardWithCtpSignup.signupPhonePrefixInput).toHaveValue(CLICK_TO_PAY_SIGNUP_PHONE.defaultPrefix);
                await cardWithCtpSignup.fillSignupDetails({
                    firstName: SHOPPER_DATA.firstName,
                    mobileNumber: CLICK_TO_PAY_SIGNUP_PHONE.typedNumber
                });

                await expect
                    .poll(() => cardWithCtpSignup.getClickToPaySignupPayload())
                    .toEqual({
                        storeClickToPayProfile: true,
                        shopperName: { firstName: SHOPPER_DATA.firstName },
                        telephoneNumber: `${CLICK_TO_PAY_SIGNUP_PHONE.defaultPrefix}${CLICK_TO_PAY_SIGNUP_PHONE.typedNumber}`
                    });
            });

            test('#5 should not add sign up data when the shopper does not check the consent', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeVisible();

                await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({});
            });

            test('#6 should remove the sign up data when the shopper unchecks the consent after filling in the details', async ({
                cardWithCtpSignup
            }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

                await cardWithCtpSignup.checkSignupConsent();
                await cardWithCtpSignup.fillSignupDetails({ firstName: SHOPPER_DATA.firstName, shopperEmail: SHOPPER_DATA.email });

                await cardWithCtpSignup.uncheckSignupConsent();
                await expect(cardWithCtpSignup.signupDetailsGroup).toBeHidden();

                await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({});
            });

            test('#7 should remove the sign up data when the card number changes to a brand other than Mastercard', async ({ cardWithCtpSignup }) => {
                await cardWithCtpSignup.goto(signupUrl());
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

                await cardWithCtpSignup.checkSignupConsent();
                await cardWithCtpSignup.fillSignupDetails({ firstName: SHOPPER_DATA.firstName, shopperEmail: SHOPPER_DATA.email });

                await cardWithCtpSignup.deleteCardNumber();
                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(VISA_CARD);
                await expect.poll(() => cardWithCtpSignup.getPaymentMethodBrand()).toBe('visa');
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();

                await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({});
            });

            test('#8 should remove the sign up data when the shopper selects the other brand of a dual branded card', async ({
                cardWithCtpSignup,
                page
            }) => {
                await binLookupMock(page, dualBrandedBcmcAndMc);
                await cardWithCtpSignup.goto(signupUrl(DUAL_BRAND_CONFIGURATION));

                await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(BCMC_DUAL_BRANDED_MC);
                await cardWithCtpSignup.selectBrand(/mastercard/i);

                await cardWithCtpSignup.checkSignupConsent();
                await cardWithCtpSignup.fillSignupDetails({ firstName: SHOPPER_DATA.firstName, shopperEmail: SHOPPER_DATA.email });

                await cardWithCtpSignup.selectBrand(/bancontact/i);
                await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();

                await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({});
            });
        });

        test('should match the screenshot of the expanded sign up', { tag: [TAGS.SCREENSHOT] }, async ({ cardWithCtpSignup, page, browserName }) => {
            await cardWithCtpSignup.goto(signupUrl());
            await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);

            await cardWithCtpSignup.checkSignupConsent();
            await expect(cardWithCtpSignup.signupDetailsGroup).toBeVisible();
            await expect(cardWithCtpSignup.signupPhonePrefixInput).toHaveValue(CLICK_TO_PAY_SIGNUP_PHONE.defaultPrefix);
            await page.evaluate(() => document.fonts.ready);

            await toHaveScreenshot(cardWithCtpSignup.componentRoot, browserName, 'card-click-to-pay-signup-expanded.png');
        });
    });

    test.describe('when the shopper is recognized by Click to Pay', () => {
        test.beforeEach(async ({ page }) => {
            await mastercardClickToPaySdkMock(page, { recognized: true });
        });

        test('#1 should not show the sign up after the shopper chooses manual card entry and enters a Mastercard number', async ({
            cardWithCtpSignup
        }) => {
            await cardWithCtpSignup.gotoAsRecognizedShopper(signupUrl());
            await cardWithCtpSignup.openManualCardEntry();

            await cardWithCtpSignup.typeCardNumberAndWaitForBinLookup(REGULAR_TEST_CARD);
            await expect.poll(() => cardWithCtpSignup.getPaymentMethodBrand()).toBe('mc');
            await expect(cardWithCtpSignup.signupConsentCheckbox).toBeHidden();

            await expect.poll(() => cardWithCtpSignup.getClickToPaySignupPayload()).toEqual({});
        });
    });
});
