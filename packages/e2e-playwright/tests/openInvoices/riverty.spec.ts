import { test, expect } from '../../pages/openInvoices/openInvoices.fixture';

import LANG from '../../../lib/src/language/locales/en-US.json';

const SR_PREFIX = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? '' : '-sr';

const INVALID_FORMAT_EXPECTS = LANG['invalidFormatExpects'].replace('%{format}', `99999${SR_PREFIX}`);

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
    `${BILLING_ADDRESS} ${LANG['postalCode']}: ${INVALID_FORMAT_EXPECTS}`,
    `${BILLING_ADDRESS} ${LANG['city']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['deliveryAddress.firstName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['deliveryAddress.lastName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['street']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['houseNumberOrName']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${DELIVERY_ADDRESS} ${LANG['postalCode']}: ${INVALID_FORMAT_EXPECTS}`,
    `${DELIVERY_ADDRESS} ${LANG['city']}: ${LANG['error.va.gen.01']}${SR_PREFIX}`,
    `${LANG['consent.checkbox.invalid']}${SR_PREFIX}`
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

                    expect(retrievedText).toEqual(expectedSRPanelTexts[index]);
                });
            });

        // KEEP - handy for debugging test
        // await expect(page.getByText('Enter your first name-sr', { exact: true })).toBeVisible();

        await page.waitForTimeout(1000);
    });
});
