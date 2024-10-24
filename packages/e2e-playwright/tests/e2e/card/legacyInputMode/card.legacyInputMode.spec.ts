import { test, expect } from '../../../../fixtures/cards/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../../utils/getStoryUrl';

test('#1 By default expect all securedFields to have inputs with type="text" & inputmode="numeric"', async ({ cardPage }) => {
    await cardPage.goto(URL_MAP.card);
    const panInputType = await cardPage.cardNumberInput.getAttribute('type');
    await expect(panInputType).toEqual('text');

    const panInputMode = await cardPage.cardNumberInput.getAttribute('inputmode');
    await expect(panInputMode).toEqual('numeric');

    const expiryDateInputType = await cardPage.expiryDateInput.getAttribute('type');
    await expect(expiryDateInputType).toEqual('text');

    const expiryDateInputMode = await cardPage.expiryDateInput.getAttribute('inputmode');
    await expect(expiryDateInputMode).toEqual('numeric');

    const cvcInputType = await cardPage.cvcInput.getAttribute('type');
    await expect(cvcInputType).toEqual('text');

    const cvcInputMode = await cardPage.cvcInput.getAttribute('inputmode');
    await expect(cvcInputMode).toEqual('numeric');
});

test('#2 Set legacyInputMode and expect all securedFields to have inputs with type="tel"', async ({ page, cardPage }) => {
    await cardPage.goto(
        getStoryUrl({
            baseUrl: URL_MAP.card,
            componentConfig: {
                legacyInputMode: true
            }
        })
    );

    const panInputType = await cardPage.cardNumberInput.getAttribute('type');
    await expect(panInputType).toEqual('tel');

    const panInputMode = await cardPage.cardNumberInput.getAttribute('inputmode');
    await expect(panInputMode).toBeNull();

    const expiryDateInputType = await cardPage.expiryDateInput.getAttribute('type');
    await expect(expiryDateInputType).toEqual('tel');

    const expiryDateInputMode = await cardPage.expiryDateInput.getAttribute('inputmode');
    await expect(expiryDateInputMode).toBeNull();

    const cvcInputType = await cardPage.cvcInput.getAttribute('type');
    await expect(cvcInputType).toEqual('tel');

    const cvcInputMode = await cardPage.cvcInput.getAttribute('inputmode');
    await expect(cvcInputMode).toBeNull();
});
