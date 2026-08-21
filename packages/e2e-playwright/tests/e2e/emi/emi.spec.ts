import { test as base, expect } from '../../../fixtures/base-fixture';
import { EMI } from '../../../models/emi';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { emiPlansMock } from '../../../mocks/emiPlans/emiPlans.mock';
import { emiPlansResponseMock } from '../../../../lib/src/components/EMI/stories/mocks';
import { PAYMENT_RESULT, TEST_CVC_VALUE, TEST_DATE_VALUE, THREEDS2_FULL_FLOW_CARD, THREEDS2_CHALLENGE_PASSWORD } from '../../utils/constants';

type Fixture = {
    emiPage: EMI;
};

const test = base.extend<Fixture>({
    emiPage: async ({ page }, use) => {
        await use(new EMI(page));
    }
});

// The story fetches its plans from the merchant backend, which the E2E build does not mock for it
test.beforeEach(async ({ page }) => {
    await emiPlansMock(page, emiPlansResponseMock);
});

test.describe('EMI - CardEmi (Native Pay Button)', () => {
    test('renders embedded card form with native pay button', async ({ emiPage }) => {
        await emiPage.goto(URL_MAP.emi);

        await expect(emiPage.cardNumberField).toBeVisible();
        await expect(emiPage.holderNameField).not.toBeVisible();

        const nativePayButton = emiPage.page.getByRole('button', { name: /pay/i });
        await expect(nativePayButton).toBeVisible();

        const customButton = emiPage.page.locator('#custom-pay-button');
        await expect(customButton).not.toBeVisible();
    });
});

test.describe('EMI - CardEmiWithCustomButton (Custom Pay Button)', () => {
    test('renders card form with external custom button and triggers validation on click', async ({ emiPage }) => {
        await emiPage.goto(URL_MAP.emiWithCustomButton);

        await expect(emiPage.cardNumberField).toBeVisible();

        const customButton = emiPage.page.locator('#custom-pay-button');

        await expect(customButton).toBeVisible();

        const payButtons = emiPage.page.getByRole('button', { name: /pay/i });
        await expect(payButtons).toHaveCount(1);

        await customButton.click();

        await expect(emiPage.errorFields.first()).toBeVisible();
    });
});

test.describe('EMI - 3DS2 Full Flow', () => {
    test('should complete full 3DS2 flow (fingerprint & challenge)', async ({ page, emiPage }) => {
        // Advanced flow: the details call goes to the mock server, not to a session endpoint
        const makeDetailsCallResponsePromise = page.waitForResponse(response => response.url().includes('/payments/details'));

        await emiPage.goto(URL_MAP.emi);

        await emiPage.typeCardNumber(THREEDS2_FULL_FLOW_CARD);
        await emiPage.typeCvc(TEST_CVC_VALUE);
        await emiPage.typeExpiryDate(TEST_DATE_VALUE);
        await emiPage.pay();

        await emiPage.threeDs2Challenge.fillInPassword(THREEDS2_CHALLENGE_PASSWORD);
        await emiPage.threeDs2Challenge.submit();

        const detailsCallResponse = await makeDetailsCallResponsePromise;

        await expect(emiPage.paymentResult).toContainText(PAYMENT_RESULT.authorised);
        expect(detailsCallResponse.status()).toBe(200);
    });
});
