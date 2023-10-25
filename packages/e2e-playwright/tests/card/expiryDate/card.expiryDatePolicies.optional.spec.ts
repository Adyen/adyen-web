import { test, expect } from '../../../pages/cards/card.fixture';
import { REGULAR_TEST_CARD } from '../../utils/constants';
import { binLookupMock } from '../../../mocks/binLookup/binLookup.mock';
import { optionalDateAndCvcMock } from '../../../mocks/binLookup/binLookup.data';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const DATE_LABEL = LANG['creditCard.expiryDate.label'];
const CVC_LABEL = LANG['creditCard.securityCode.label'];
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];
const OPTIONAL = LANG['field.title.optional'];
test.describe('Test how Card Component handles optional expiryDate policy', () => {
    test.only('#1 Testing optional expiryDatePolicy - how UI & state respond', async ({ cardExpiryDatePoliciesPage }) => {
        const { card, page } = cardExpiryDatePoliciesPage;

        await binLookupMock(page, optionalDateAndCvcMock);

        await card.isComponentVisible();

        // Fill number to provoke mock binLookup response
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // UI reflects that binLookup says expiryDate is optional
        await expect(card.expiryDateLabelText).toHaveText(`${DATE_LABEL} ${OPTIONAL}`);

        // ...and cvc is optional too
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);

        // Card seen as valid
        let cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(true);

        // Clear number and see UI & state reset
        await card.deleteCardNumber();

        // date and cvc labels don't contain 'optional'
        await expect(card.expiryDateLabelText).toHaveText(DATE_LABEL);
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL);

        // Card seen as invalid
        cardValid = await page.evaluate('window.card.isValid');
        await expect(cardValid).toEqual(false);
    });
});
