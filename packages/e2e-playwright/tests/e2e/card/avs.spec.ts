import { test, expect } from '../../../fixtures/card.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE, TEST_POSTCODE } from '../../utils/constants';
import { URL_MAP } from '../../../fixtures/URL_MAP';

test.describe('Card payments with address lookup', () => {
    test('should make a successful card payment', async ({ cardWithAvs }) => {
        await cardWithAvs.goto(URL_MAP.addressLookupUrl);
        await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
        await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
        await cardWithAvs.fillCvc(TEST_CVC_VALUE);

        await cardWithAvs.billingAddress.searchAddressAndChooseTheFirst('1');
        await cardWithAvs.pay();
        await cardWithAvs.paymentResult.waitFor({ state: 'visible' });
        await expect(cardWithAvs.paymentResult).toContainText(PAYMENT_RESULT.authorised);
    });
});

test.describe('Card payments with partial avs', () => {
    test.describe('When fill in a valid the post code', () => {
        test('should make a successful card payment', async ({ cardWithAvs }) => {
            await cardWithAvs.goto(URL_MAP.cardWithPartialAvs);
            await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
            await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
            await cardWithAvs.fillCvc(TEST_CVC_VALUE);
            await cardWithAvs.billingAddress.fillInPostCode(TEST_POSTCODE);
            await cardWithAvs.pay();
            await cardWithAvs.paymentResult.waitFor({ state: 'visible' });
            await expect(cardWithAvs.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('When not fill in a post code ', () => {
        test('should not submit the payment', async ({ cardWithAvs }) => {
            await cardWithAvs.goto(URL_MAP.cardWithPartialAvs);
            await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
            await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
            await cardWithAvs.fillCvc(TEST_CVC_VALUE);
            await cardWithAvs.pay();
            await expect(cardWithAvs.billingAddress.postalCodeError).toContainText('Enter the zip code');
        });
    });
});

test.describe('Card payments with full avs', () => {
    test.describe('When fill in the valid address data', () => {
        test('should make a successful card payment', async ({ cardWithAvs }) => {
            await cardWithAvs.goto(URL_MAP.fullAvsWithoutPrefilledDataUrl);
            await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
            await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
            await cardWithAvs.fillCvc(TEST_CVC_VALUE);

            await cardWithAvs.billingAddress.selectCountry({ name: 'United States' });
            await cardWithAvs.billingAddress.fillInStreet('Test address');
            await cardWithAvs.billingAddress.fillInCity('Test city');
            await cardWithAvs.billingAddress.selectState({ name: 'Florida' });
            await cardWithAvs.billingAddress.fillInPostCode('12345');
            await cardWithAvs.pay();
            await cardWithAvs.paymentResult.waitFor({ state: 'visible' });
            await expect(cardWithAvs.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });
    });

    test.describe('When fill in the invalid address data', () => {
        test('should not submit the payment', async ({ cardWithAvs }) => {
            await cardWithAvs.goto(URL_MAP.fullAvsWithoutPrefilledDataUrl);
            await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
            await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
            await cardWithAvs.fillCvc(TEST_CVC_VALUE);

            await cardWithAvs.billingAddress.selectCountry({ name: 'United States' });
            await cardWithAvs.pay();
            await expect(cardWithAvs.billingAddress.streetInputError).toContainText('Enter the address');
            await expect(cardWithAvs.billingAddress.cityError).toContainText('Enter the city');
            await expect(cardWithAvs.billingAddress.stateError).toContainText('Enter the state');
            await expect(cardWithAvs.billingAddress.postalCodeError).toContainText('Enter the zip code');
        });
    });

    test.describe('When switching to a different delivery country', () => {
        test('should make a successful card payment', async ({ cardWithAvs }) => {
            const url =
                '/iframe.html?globals=&args=componentConfiguration.billingAddressAllowedCountries:!undefined;componentConfiguration.data.billingAddress.postalCode:A9A9A9&id=cards-card--with-avs&viewMode=story';
            await cardWithAvs.goto(url);
            await expect(cardWithAvs.billingAddress.postalCodeError).toContainText('Invalid format. Expected format');
            await cardWithAvs.billingAddress.selectCountry({ name: 'Japan' });
            await cardWithAvs.fillCardNumber(REGULAR_TEST_CARD);
            await cardWithAvs.fillExpiryDate(TEST_DATE_VALUE);
            await cardWithAvs.fillCvc(TEST_CVC_VALUE);
            await cardWithAvs.pay();
            await cardWithAvs.paymentResult.waitFor({ state: 'visible' });
            await expect(cardWithAvs.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('should not submit the payment', async ({ cardWithAvs }) => {
            await cardWithAvs.goto(URL_MAP.fullAvsWithPrefilledDataUrl);
            await cardWithAvs.billingAddress.selectCountry({ name: 'Canada' });
            await expect(cardWithAvs.billingAddress.postalCodeError).toContainText('Invalid format. Expected format');
        });
    });
});
