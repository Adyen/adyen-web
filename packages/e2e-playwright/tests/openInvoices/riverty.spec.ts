import { test, expect } from '../../pages/openInvoices/openInvoices.fixture';

import LANG from '../../../lib/src/language/locales/en-US.json';

const REQUIRED_FIELD = LANG['field.error.required'].replace('%{label}', '');

const BILLING_ADDRESS = LANG['billingAddress'];
const DELIVERY_ADDRESS = LANG['deliveryAddress'];

const expectedSRPanelTexts = [
    `${LANG['firstName.invalid']}`,
    `${LANG['lastName.invalid']}`,
    `${REQUIRED_FIELD}${LANG['dateOfBirth']}`,
    `${REQUIRED_FIELD}${LANG['shopperEmail']}`,
    `${REQUIRED_FIELD}${LANG['telephoneNumber']}`,
    `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['street']}`,
    `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['houseNumberOrName']}`,
    `${REQUIRED_FIELD}${BILLING_ADDRESS} ${LANG['postalCode']}`,
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
    test('#1 Test how Riverty component handles SRPanel messages', async ({ openInvoicesPage_riverty }) => {
        const { openInvoices, page } = openInvoicesPage_riverty;

        await openInvoices.isComponentVisible();

        await openInvoices.rivertyDeliveryAddressCheckbox.click();

        await openInvoicesPage_riverty.pay();

        // Need to wait so that the expected elements can be found by locator.allInnerTexts
        await page.waitForTimeout(100);

        // Inspect SRPanel errors: all expected errors, in the expected order
        await page
            .locator('.adyen-checkout-sr-panel__msg')
            .allInnerTexts()
            .then(retrievedSRPanelTexts => {
                retrievedSRPanelTexts.forEach((retrievedText, index) => {
                    // KEEP - handy for debugging test
                    // console.log('\n### riverty.spec:::: retrievedText', retrievedText);
                    // console.log('### riverty.spec:::: expectedTexts', expectedSRPanelTexts[index]);

                    expect(retrievedText).toContain(expectedSRPanelTexts[index]);
                });
            });

        // KEEP - handy for debugging test
        // await expect(page.getByText('Enter your first name-sr', { exact: true })).toBeVisible();

        await page.waitForTimeout(1000);
    });
});
