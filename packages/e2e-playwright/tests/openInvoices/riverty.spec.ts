import { test, expect } from '../../pages/openInvoices/openInvoices.fixture';

import LANG from '../../../server/translations/en-US.json';
import { USER_TYPE_DELAY } from '../utils/constants';

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
                // check we have srPanel errors
                expect(retrievedSRPanelTexts.length).toBeGreaterThan(0);

                // check individual messages
                retrievedSRPanelTexts.forEach((retrievedText, index) => {
                    // KEEP - handy for debugging test
                    // console.log('\n### riverty.spec:::: retrievedText', retrievedText);
                    // console.log('### riverty.spec:::: expectedTexts', expectedSRPanelTexts[index]);

                    expect(retrievedText).toContain(expectedSRPanelTexts[index]);
                });
            });

        // KEEP - handy for debugging test
        // await expect(page.getByText('Enter your first name-sr', { exact: true })).toBeVisible();
    });

    test('#2 Test how Riverty component handles SRPanel messages, specifically a postal code with an invalid format', async ({
        openInvoicesPage_riverty
    }) => {
        const { openInvoices, page } = openInvoicesPage_riverty;

        await openInvoices.isComponentVisible();

        await openInvoices.rivertyDeliveryAddressCheckbox.click();

        expectedSRPanelTexts.splice(7, 1, INVALID_POST_CODE);

        await openInvoices.riverty
            .getByRole('group', { name: 'Billing address' })
            .getByLabel('Postal code')
            // .locator('.adyen-checkout__field--postalCode .adyen-checkout__input--postalCode')
            .type('3', { delay: USER_TYPE_DELAY });

        await openInvoicesPage_riverty.pay(); // first click need to trigger blur event on postCode field
        await openInvoicesPage_riverty.pay(); // second click to trigger validation

        // Need to wait so that the expected elements can be found by locator.allInnerTexts
        await page.waitForTimeout(100);

        // Inspect SRPanel errors: all expected errors, in the expected order
        await page
            .locator('.adyen-checkout-sr-panel__msg')
            .allInnerTexts()
            .then(retrievedSRPanelTexts => {
                // check we have srPanel errors
                expect(retrievedSRPanelTexts.length).toBeGreaterThan(0);

                // check individual messages
                retrievedSRPanelTexts.forEach((retrievedText, index) => {
                    // KEEP - handy for debugging test
                    // console.log('\n### riverty.spec:::: retrievedText', retrievedText);
                    // console.log('### riverty.spec:::: expectedTexts', expectedSRPanelTexts[index]);

                    expect(retrievedText).toContain(expectedSRPanelTexts[index]);
                });
            });

        // Restore array to start state
        expectedSRPanelTexts.splice(7, 1, EMPTY_POST_CODE);
    });
});
