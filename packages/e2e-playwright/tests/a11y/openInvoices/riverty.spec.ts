import { mergeTests, expect } from '@playwright/test';
import LANG from '../../../../server/translations/en-US.json';
import { USER_TYPE_DELAY } from '../../utils/constants';
import { test as riverty } from '../../../fixtures/openInvoices.fixture';
import { test as srPanel } from '../../../fixtures/srPanel.fixture';

const test = mergeTests(riverty, srPanel);

const REQUIRED_FIELD = LANG['field.error.required'].replace('%{label}', '');

const BILLING_ADDRESS = LANG['billingAddress'];
const DELIVERY_ADDRESS = LANG['deliveryAddress'];

const EMPTY_POST_CODE = `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['postalCode']}`;
const INVALID_FORMAT_EXPECTS = LANG['invalid.format.expects'].replace(/%{label}|%{format}/g, '');
const INVALID_POST_CODE = `${BILLING_ADDRESS} ${LANG['postalCode']}${INVALID_FORMAT_EXPECTS}99999`;

const expectedSRPanelTexts = [
    `${LANG['firstName.invalid']}`,
    `${LANG['lastName.invalid']}`,
    `${REQUIRED_FIELD}${LANG['dateOfBirth']}`,
    `${REQUIRED_FIELD}${LANG['shopperEmail']}`,
    `${REQUIRED_FIELD}${LANG['telephoneNumber']}`,
    `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['street']}`,
    `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['houseNumberOrName']}`,
    EMPTY_POST_CODE,
    `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['city']}`,
    `${REQUIRED_FIELD}${DELIVERY_ADDRESS} ${LANG['deliveryAddress.firstName']}`,
    `${REQUIRED_FIELD}${DELIVERY_ADDRESS} ${LANG['deliveryAddress.lastName']}`,
    `${REQUIRED_FIELD}${DELIVERY_ADDRESS} ${LANG['street']}`,
    `${REQUIRED_FIELD}${DELIVERY_ADDRESS} ${LANG['houseNumberOrName']}`,
    `${REQUIRED_FIELD}${DELIVERY_ADDRESS} ${LANG['postalCode']}`,
    `${REQUIRED_FIELD}${DELIVERY_ADDRESS} ${LANG['city']}`,
    `${LANG['consent.checkbox.invalid']}`
];

test.describe('Test Riverty Component', () => {
    test('#1 Test how Riverty component handles SRPanel messages', async ({ page, riverty, srPanel }) => {
        await riverty.rivertyDeliveryAddressCheckbox.click();
        await riverty.pay();
        // Wait for all sr messages to show otherwise srErrorMessages.forEach fails to match one by one
        await page.waitForFunction(
            expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
            expectedSRPanelTexts.length
        );
        // Inspect SRPanel errors: all expected errors, in the expected order
        // check individual messages
        const srErrorMessages = await srPanel.allMessages;
        srErrorMessages.forEach((retrievedText, index) => {
            expect(retrievedText).toContainText(expectedSRPanelTexts[index]);
        });

        // KEEP - handy for debugging test
        // await expect(page.getByText('Enter your first name-sr', { exact: true })).toBeVisible();
    });

    test('#2 Test how Riverty component handles SRPanel messages, specifically a postal code with an invalid format', async ({
        page,
        riverty,
        srPanel
    }) => {
        await riverty.rivertyDeliveryAddressCheckbox.click();

        expectedSRPanelTexts.splice(7, 1, INVALID_POST_CODE);

        await riverty.riverty
            .getByRole('group', { name: 'Billing address' })
            .getByLabel('Postal code')
            // .locator('.adyen-checkout__field--postalCode .adyen-checkout__input--postalCode')
            .type('3', { delay: USER_TYPE_DELAY });

        await riverty.pay(); // first click need to trigger blur event on postCode field
        await riverty.pay(); // second click to trigger validation

        // Wait for all sr messages to show otherwise srErrorMessages.forEach fails to match one by one
        await page.waitForFunction(
            expectedLength => [...document.querySelectorAll('.adyen-checkout-sr-panel__msg')].map(el => el.textContent).length === expectedLength,
            expectedSRPanelTexts.length
        );

        const srErrorMessages = await srPanel.allMessages;
        // Inspect SRPanel errors: all expected errors, in the expected order
        srErrorMessages.forEach((retrievedText, index) => {
            expect(retrievedText).toContainText(expectedSRPanelTexts[index]);
        });

        // Restore array to start state
        expectedSRPanelTexts.splice(7, 1, EMPTY_POST_CODE);
    });
});
