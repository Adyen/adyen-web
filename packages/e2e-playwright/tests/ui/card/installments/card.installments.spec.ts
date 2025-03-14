import { test, expect } from '../../../../fixtures/card.fixture';
import { pressKeyboardToNextItem } from '../../../utils/keyboard';
import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../fixtures/URL_MAP';

const componentConfig = {
    installmentOptions: {
        mc: {
            values: [1, 2, 3],
            plans: ['regular', 'revolving']
        }
    }
};
const url = getStoryUrl({ baseUrl: URL_MAP.card, componentConfig });

test.describe('Cards (Installments)', () => {
    test('#1 should not add installments property to payload if one-time payment is selected (default selection)', async ({ card, page }) => {
        await card.goto(url);

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        await expect(paymentDataInstallments).toBe(undefined);
    });

    test('#2 should not add installments property to payload if 1x installment is selected', async ({ card, page }) => {
        await card.goto(url);

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Select option
        await card.installmentsPaymentLabel.click();

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        await expect(paymentDataInstallments).toBe(undefined);
    });

    test('#3 should add revolving plan to payload if selected', async ({ card, page }) => {
        await card.goto(url);

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Select option
        await card.revolvingPaymentLabel.click();

        // Headless test seems to need time for click to register on state
        await page.waitForTimeout(500);

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        await expect(paymentDataInstallments.value).toEqual(1);
        await expect(paymentDataInstallments.plan).toEqual('revolving');
    });

    test('#4 should add installments value property if regular installment > 1 is selected', async ({ card, page }) => {
        await card.goto(url);

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Select option
        await card.installmentsPaymentLabel.click();

        await card.installmentsDropdown.click();
        await pressKeyboardToNextItem(page);
        await pressKeyboardToNextItem(page);
        // await pressEnter(page);

        const listItem = await card.selectListItem('2');
        await listItem.click();

        // Headless test seems to need time for UI interaction to register on state
        await page.waitForTimeout(500);

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        await expect(paymentDataInstallments.value).toEqual(2);
    });

    test('#5 installments with full width dropdown: should add installments value property if regular installment > 1 is selected', async ({
        card,
        page
    }) => {
        await card.goto(url);

        await card.typeCardNumber(REGULAR_TEST_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Select option
        await card.installmentsPaymentLabel.click();
        await card.installmentsDropdown.click();
        await pressKeyboardToNextItem(page);
        await pressKeyboardToNextItem(page);

        const listItem = await card.selectListItem('2');
        await listItem.click();

        // Headless test seems to need time for UI interaction to register on state
        await page.waitForTimeout(500);

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        await expect(paymentDataInstallments.value).toEqual(2);
    });
});
