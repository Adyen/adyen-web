import { test, expect } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../../utils/getStoryUrl';

test('#1 By default expect all securedFields to have inputs with type="text" & inputmode="numeric"', async ({ card }) => {
    await card.goto(URL_MAP.card);
    const panInputType = await card.cardNumberInput.getAttribute('type');
    await expect(panInputType).toEqual('text');

    const panInputMode = await card.cardNumberInput.getAttribute('inputmode');
    await expect(panInputMode).toEqual('numeric');

    const expiryDateInputType = await card.expiryDateInput.getAttribute('type');
    await expect(expiryDateInputType).toEqual('text');

    const expiryDateInputMode = await card.expiryDateInput.getAttribute('inputmode');
    await expect(expiryDateInputMode).toEqual('numeric');

    const cvcInputType = await card.cvcInput.getAttribute('type');
    await expect(cvcInputType).toEqual('text');

    const cvcInputMode = await card.cvcInput.getAttribute('inputmode');
    await expect(cvcInputMode).toEqual('numeric');
});

test('#2 Set legacyInputMode and expect all securedFields to have inputs with type="tel"', async ({ page, card }) => {
    await card.goto(
        getStoryUrl({
            baseUrl: URL_MAP.card,
            componentConfig: {
                legacyInputMode: true
            }
        })
    );

    const panInputType = await card.cardNumberInput.getAttribute('type');
    await expect(panInputType).toEqual('tel');

    const panInputMode = await card.cardNumberInput.getAttribute('inputmode');
    await expect(panInputMode).toBeNull();

    const expiryDateInputType = await card.expiryDateInput.getAttribute('type');
    await expect(expiryDateInputType).toEqual('tel');

    const expiryDateInputMode = await card.expiryDateInput.getAttribute('inputmode');
    await expect(expiryDateInputMode).toBeNull();

    const cvcInputType = await card.cvcInput.getAttribute('type');
    await expect(cvcInputType).toEqual('tel');

    const cvcInputMode = await card.cvcInput.getAttribute('inputmode');
    await expect(cvcInputMode).toBeNull();
});
