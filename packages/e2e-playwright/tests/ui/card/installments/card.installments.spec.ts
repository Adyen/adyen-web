import { test, expect } from '../../../../fixtures/card.fixture';
import { pressKeyboardToNextItem } from '../../../utils/keyboard';
import { REGULAR_TEST_CARD, TAGS, TEST_CVC_VALUE, TEST_DATE_VALUE, VISA_CARD } from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../../utils/assertions';

const componentConfig = {
    installmentOptions: {
        mc: {
            values: [1, 2, 3],
            plans: ['regular', 'revolving']
        },
        visa: {
            values: [1, 2, 3],
            plans: ['regular', 'revolving', 'bonus']
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
        expect(paymentDataInstallments).toBe(undefined);
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
        expect(paymentDataInstallments).toBe(undefined);
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
        expect(paymentDataInstallments.value).toEqual(1);
        expect(paymentDataInstallments.plan).toEqual('revolving');
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

        const listItem = await card.selectListItem('2');
        await listItem.click();

        // Headless test seems to need time for UI interaction to register on state
        await page.waitForTimeout(500);

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        expect(paymentDataInstallments.value).toEqual(2);
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
        expect(paymentDataInstallments.value).toEqual(2);
    });

    test('#6 should add bonus plan to payment data when selected', async ({ card, page }) => {
        await card.goto(url);

        await card.typeCardNumber(VISA_CARD);
        await card.typeExpiryDate(TEST_DATE_VALUE);
        await card.typeCvc(TEST_CVC_VALUE);

        // Select option
        await card.bonusPaymentLabel.click();

        // Headless test seems to need time for UI interaction to register on state
        await page.waitForTimeout(500);

        // Inspect card.data
        const paymentDataInstallments: any = await page.evaluate('window.component.data.installments');
        expect(paymentDataInstallments.value).toEqual(1);
        expect(paymentDataInstallments.plan).toEqual('bonus');
    });

    test('#7 should show different installment options based on the card brand', { tag: [TAGS.SCREENSHOT] }, async ({ card, browserName }) => {
        await card.goto(url);

        // Test with Mastercard
        await card.typeCardNumber(REGULAR_TEST_CARD);

        // Check if Installments and Revolving are shown
        await expect(card.installmentsPaymentLabel).toBeVisible();
        await expect(card.revolvingPaymentLabel).toBeVisible();
        await expect(card.bonusPaymentLabel).not.toBeVisible();

        await toHaveScreenshot(card.rootElement, browserName, 'card-installments-without-bonus-option.png');

        // Clean up the UI
        await card.deleteCardNumber();

        await toHaveScreenshot(card.rootElement, browserName, 'card-installments-without-installments-ui.png');

        // Test with Visa
        await card.typeCardNumber(VISA_CARD);

        // Check if Installments, Revolving and Bonus are shown
        await expect(card.installmentsPaymentLabel).toBeVisible();
        await expect(card.revolvingPaymentLabel).toBeVisible();
        await expect(card.bonusPaymentLabel).toBeVisible();

        await toHaveScreenshot(card.rootElement, browserName, 'card-installments-with-bonus-option.png');
    });
});
