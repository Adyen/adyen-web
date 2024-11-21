import { expect, test } from '../../../../fixtures/card.fixture';
import { PAYMENT_RESULT, REGULAR_TEST_CARD, TEST_CPF_VALUE, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { binLookupMock } from '../../../../mocks/binLookup/binLookup.mock';
import { socialSecurityNumberRequiredMock } from '../../../../mocks/binLookup/binLookup.data';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

test.describe('Card payment with Social Security Number ', () => {
    test.describe('with "socialSecurityNumberMode" set to "show"', () => {
        test('should make a payment with a valid SSN', async ({ cardWithSSN }) => {
            await cardWithSSN.goto(URL_MAP.cardWithSsn);

            await cardWithSSN.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithSSN.typeCvc(TEST_CVC_VALUE);
            await cardWithSSN.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithSSN.typeSsn(TEST_CPF_VALUE);
            await cardWithSSN.pay();

            await expect(cardWithSSN.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        });

        test('should display an error if SSN is not valid', async ({ cardWithSSN }) => {
            await cardWithSSN.goto(URL_MAP.cardWithSsn);

            await cardWithSSN.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithSSN.typeCvc(TEST_CVC_VALUE);
            await cardWithSSN.typeExpiryDate(TEST_DATE_VALUE);
            await cardWithSSN.typeSsn('100200300');
            await cardWithSSN.pay();

            await expect(cardWithSSN.ssnInputErrorElement).toBeVisible();
        });
    });

    test.describe('with binLookup forcing the field to be shown ("auto" mode)', () => {
        test('should display the SSN field once the card is entered', async ({ page, cardWithSSN }) => {
            await binLookupMock(page, socialSecurityNumberRequiredMock);
            await cardWithSSN.goto(URL_MAP.card);

            await expect(cardWithSSN.ssnInput).not.toBeVisible();

            await cardWithSSN.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithSSN.typeCvc(TEST_CVC_VALUE);
            await cardWithSSN.typeExpiryDate(TEST_DATE_VALUE);

            await expect(cardWithSSN.ssnInput).toBeVisible();
        });

        test('should perform SSN validation if the field is displayed', async ({ page, cardWithSSN }) => {
            await binLookupMock(page, socialSecurityNumberRequiredMock);
            await cardWithSSN.goto(URL_MAP.card);

            await cardWithSSN.typeCardNumber(REGULAR_TEST_CARD);
            await cardWithSSN.typeCvc(TEST_CVC_VALUE);
            await cardWithSSN.typeExpiryDate(TEST_DATE_VALUE);

            await cardWithSSN.pay();

            await expect(cardWithSSN.ssnInputErrorElement).toBeVisible();
        });
    });
});
