import { test, expect } from '../../../../../fixtures/card.fixture';
import { THREEDS2_MAESTRO_CARD, BCMC_CARD } from '../../../../utils/constants';
import { URL_MAP } from '../../../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../../../utils/getStoryUrl';

import LANG from '../../../../../../server/translations/en-US.json';
const CVC_LABEL = LANG['creditCard.securityCode.label'];
const CVC_LABEL_OPTIONAL = LANG['creditCard.securityCode.label.optional'];

const componentConfig = {
    brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro']
};

test.describe('Card - testing /binLookup as it affects the cvc field', () => {
    test('#1 Should fill in a PAN that will lead to cvc being hidden', async ({ card, page }) => {
        // Regular card
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // Visible & required cvc field
        await expect(card.cvcField).toBeVisible();
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL);
        await expect(card.cvcLabelText).not.toHaveText(CVC_LABEL_OPTIONAL);

        // PAN that will trigger /binLookup with cvcPolicy:"hidden"
        await card.typeCardNumber(BCMC_CARD);

        // Hidden cvc field
        await expect(card.cvcField).not.toBeVisible();

        // Reset UI by deleting number
        await card.deleteCardNumber();

        // Visible, required cvc field
        await expect(card.cvcField).toBeVisible();
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL);
        await expect(card.cvcLabelText).not.toHaveText(CVC_LABEL_OPTIONAL);
    });

    test('#2 Should fill in a PAN that will lead to cvc being optional', async ({ card, page }) => {
        // Regular card
        await card.goto(getStoryUrl({ baseUrl: URL_MAP.card, componentConfig }));

        // PAN that will trigger /binLookup with cvcPolicy:"optional"
        await card.typeCardNumber(THREEDS2_MAESTRO_CARD);

        // Optional cvc field
        await expect(card.cvcField).toBeVisible();
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL_OPTIONAL);
        await expect(card.cvcLabelText).not.toHaveText(CVC_LABEL);

        // Reset UI by deleting number
        await card.deleteCardNumber();

        // Visible, required cvc field
        await expect(card.cvcField).toBeVisible();
        await expect(card.cvcLabelText).toHaveText(CVC_LABEL);
        await expect(card.cvcLabelText).not.toHaveText(CVC_LABEL_OPTIONAL);
    });
});
