import { test, expect } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

test('#1 Clicking on card icons should focus the respective inputs', async ({ card, page }) => {
    await card.goto(URL_MAP.card);

    await card.selectBrand('card'); // select the generic "no card" icon

    await expect(card.cardNumberInput).toBeFocused();

    await card.selectDateIcon();

    await expect(card.expiryDateInput).toBeFocused();

    await card.selectCVCIcon();

    await expect(card.cvcInput).toBeFocused();
});
