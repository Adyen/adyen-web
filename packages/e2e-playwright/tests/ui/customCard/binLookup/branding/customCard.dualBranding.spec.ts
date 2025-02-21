import { test, expect } from '../../../../../fixtures/customCard.fixture';
import { BCMC_CARD } from '../../../../utils/constants';

test.describe('Custom Card - Dual branding', () => {
    test('#1 Entering a dual branded number shows the expected icons, whilst setting nothing in state', async ({
        customCardSeparateExpiryDate: customCard,
        page
    }) => {
        await customCard.typeCardNumber(BCMC_CARD);

        // Single band holder hidden
        await expect(customCard.singleBrandHolder).not.toBeVisible();

        // Dual brand holder visible
        await expect(customCard.dualBrandsHolder).toBeVisible();

        await customCard.waitForVisibleBrands();

        let [firstBrand, secondBrand] = await customCard.dualBrands;

        // 2 brand icons, in correct order
        expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
        expect(secondBrand).toHaveAttribute('data-value', 'maestro');

        const cardData: any = await page.evaluate('window.customCardSeparate.data');

        // Check brand has not been set in paymentMethod data
        expect(cardData.paymentMethod.brand).toBe(undefined);
    });

    test('#2 Entering a dual branded number and clicking the icons, sets the expected values in state', async ({
        customCardSeparateExpiryDate: customCard,
        page
    }) => {
        await customCard.typeCardNumber(BCMC_CARD);

        await customCard.waitForVisibleBrands();

        // Select brand
        await customCard.selectBrand('bcmc');

        // For some reason: await page.evaluate('window.customCardSeparate.data'); is really flaky in this test...
        // ...so we're doing it this way instead. The test will timeout if brand *not* set to expected value
        await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === 'bcmc');

        // Select 2nd brand
        await customCard.selectBrand('maestro');

        await page.waitForFunction(() => window['customCardSeparate'].data.paymentMethod.brand === 'maestro');
    });
});
