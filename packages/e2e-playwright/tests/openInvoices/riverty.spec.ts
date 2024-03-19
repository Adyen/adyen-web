import { test, expect } from '../../pages/openInvoices/openInvoices.fixture';

import LANG from '../../../lib/src/language/locales/en-US.json';

// const expectedSRPanelTexts = [
//     'Enter your first name-sr',
//     'Enter your last name-sr',
//     'Date of birth: Enter a valid date of birth that indicates you are at least 18 years old-sr',
//     'Invalid email address-sr',
//     'Invalid telephone number-sr',
//     'Billing address Street: Incomplete field-sr',
//     'Billing address House number: Incomplete field-sr',
//     'Billing address Postal code: Invalid format. Expected format: 99999-sr',
//     'Billing address City: Incomplete field-sr',
//     'Delivery Address Recipient first name: Incomplete field-sr',
//     'Delivery Address Recipient last name: Incomplete field-sr',
//     'Delivery Address Street: Incomplete field-sr',
//     'Delivery Address House number: Incomplete field-sr',
//     'Delivery Address Postal code: Invalid format. Expected format: 99999-sr',
//     'Delivery Address City: Incomplete field-sr',
//     'You must agree with the terms & conditions-sr'
// ];

const SR_PREFIX = '-sr';

const BILLING_ADDRESS = LANG['billingAddress'];
const DELIVERY_ADDRESS = LANG['deliveryAddress'];

const expectedSRPanelTexts = [
    `${LANG['firstName.invalid']}${SR_PREFIX}`,
    `${LANG['lastName.invalid']}${SR_PREFIX}`,
    `${LANG['dateOfBirth.invalid']}${SR_PREFIX}`,
    `${LANG['shopperEmail.invalid']}${SR_PREFIX}`,
    `${LANG['telephoneNumber.invalid']}${SR_PREFIX}`,
    `${BILLING_ADDRESS} ${LANG['street']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${BILLING_ADDRESS} ${LANG['houseNumberOrName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${BILLING_ADDRESS} ${LANG['postalCode']}: Invalid format. Expected format: 99999-sr`,
    `${BILLING_ADDRESS} ${LANG['city']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['deliveryAddress.firstName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['deliveryAddress.lastName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['street']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['houseNumberOrName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['postalCode']}: Invalid format. Expected format: 99999-sr`,
    `${DELIVERY_ADDRESS} ${LANG['city']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${LANG['consent.checkbox.invalid']}${SR_PREFIX}`
];

test.describe('Test Riverty Component', () => {
    test('#1 test how Riverty component handles SRPanel messages', async ({ openInvoicesPage_riverty }) => {
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
                    // console.log('\n### riverty.spec:::: retrievedText', retrievedText);
                    // console.log('### riverty.spec:::: expectedTexts', expectedSRPanelTexts[index]);

                    expect(retrievedText).toEqual(expectedSRPanelTexts[index]);
                });
            });

        // Inspect SRPanel errors
        // await expect(page.getByText('Enter your first name-sr', { exact: true })).toBeVisible();

        await page.waitForTimeout(1000);
    });
});
