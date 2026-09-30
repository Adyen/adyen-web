import { test, expect } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../../utils/getStoryUrl';

test('#1 By default expect all securedFields to have inputs with type="text" & inputmode="numeric"', async ({ card }) => {
    await card.goto(URL_MAP.card);
    await expect(card.cardNumberInput).toHaveAttribute('type', 'text');
    await expect(card.cardNumberInput).toHaveAttribute('inputmode', 'numeric');

    await expect(card.expiryDateInput).toHaveAttribute('type', 'text');
    await expect(card.expiryDateInput).toHaveAttribute('inputmode', 'numeric');

    await expect(card.cvcInput).toHaveAttribute('type', 'text');
    await expect(card.cvcInput).toHaveAttribute('inputmode', 'numeric');
});

test('#2 Set legacyInputMode and expect all securedFields to have inputs with type="tel"', async ({ card }) => {
    await card.goto(
        getStoryUrl({
            baseUrl: URL_MAP.card,
            componentConfig: {
                legacyInputMode: true
            }
        })
    );

    await expect(card.cardNumberInput).toHaveAttribute('type', 'tel');
    await expect(card.cardNumberInput).not.toHaveAttribute('inputmode');

    await expect(card.expiryDateInput).toHaveAttribute('type', 'tel');
    await expect(card.expiryDateInput).not.toHaveAttribute('inputmode');

    await expect(card.cvcInput).toHaveAttribute('type', 'tel');
    await expect(card.cvcInput).not.toHaveAttribute('inputmode');
});
