import { test, expect } from '../../../../fixtures/card.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { BCMC_CARD, BCMC_DUAL_BRANDED_VISA, UNKNOWN_VISA_CARD } from '../../../utils/constants';

test.describe('Testing Bancontact, with dual branded cards, how UI resets', () => {
    test(
        '#1 Fill in dual branded card then ' +
            'check that brands have been sorted to place Bcmc first then ' +
            'ensure only bcmc logo shows after deleting digits',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.fillCardNumber(BCMC_CARD);

            await bcmc.waitForVisibleBrands();

            let [firstBrand, secondBrand] = await bcmc.brands;

            // Correct order
            expect(firstBrand).toHaveAttribute('data-value', 'bcmc');
            expect(secondBrand).toHaveAttribute('data-value', 'maestro');

            await bcmc.deleteCardNumber();

            await bcmc.waitForVisibleBrands(1);

            [firstBrand, secondBrand] = await bcmc.brands;

            // Now only a single brand
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();
        }
    );

    test('#2 Fill in dual branded card then ' + 'select maestro & see that cvc field is hidden even though it is maestro ', async ({ bcmc }) => {
        await bcmc.goto(URL_MAP.bcmc);

        await bcmc.isComponentVisible();

        await bcmc.fillCardNumber(BCMC_CARD);

        await bcmc.waitForVisibleBrands();

        await bcmc.selectBrand('Maestro');

        // Due to brand sorting and priority being given to the Bcmc brand - cvc should remain hidden
        // even tho' maestro has been selected
        await bcmc.cvcField.waitFor({ state: 'hidden' });
    });

    test(
        '#3 Fill in dual branded card then ' +
            'paste in number not recognised by binLookup (but that our local regEx will recognise as Visa)' +
            'see that UI stays looking like a BCMC card i.e. bcmc logo remains showing',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.typeCardNumber(BCMC_CARD);

            // "paste"
            await bcmc.fillCardNumber(UNKNOWN_VISA_CARD);

            await bcmc.waitForVisibleBrands(1);

            const [firstBrand, secondBrand] = await bcmc.brands;

            // Remains a single brand
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();
        }
    );

    test(
        '#4 Fill in dual branded card then ' +
            'select visa & see that cvc field shows then' +
            'paste in number not recognised by binLookup (but that our local regEx will recognise as Visa) ' +
            'see that UI stays looking like a BCMC card i.e. bcmc logo remains showing and cvc field is hidden again',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);

            await bcmc.waitForVisibleBrands();

            await bcmc.selectBrand('Visa');

            await bcmc.cvcField.waitFor({ state: 'visible' });

            // "paste"
            await bcmc.fillCardNumber(UNKNOWN_VISA_CARD);

            await bcmc.waitForVisibleBrands(1);

            const [firstBrand, secondBrand] = await bcmc.brands;

            // Returns to a Bcmc
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();

            // with hidden cvc
            await bcmc.cvcField.waitFor({ state: 'hidden' });
        }
    );

    test(
        '#5 Fill in dual branded card then ' +
            'select visa & see that cvc field shows then' +
            'delete number and see that bcmc logo remains showing and cvc field is hidden again',
        async ({ bcmc }) => {
            await bcmc.goto(URL_MAP.bcmc);

            await bcmc.isComponentVisible();

            await bcmc.fillCardNumber(BCMC_DUAL_BRANDED_VISA);

            await bcmc.waitForVisibleBrands();

            await bcmc.selectBrand('Visa');

            await bcmc.cvcField.waitFor({ state: 'visible' });

            // "paste"
            await bcmc.deleteCardNumber();

            await bcmc.waitForVisibleBrands(1);

            const [firstBrand, secondBrand] = await bcmc.brands;

            // Returns to a Bcmc
            expect(firstBrand).toHaveAttribute('alt', /bancontact/i);
            expect(secondBrand).toBeUndefined();

            // with hidden cvc
            await bcmc.cvcField.waitFor({ state: 'hidden' });
        }
    );
});
