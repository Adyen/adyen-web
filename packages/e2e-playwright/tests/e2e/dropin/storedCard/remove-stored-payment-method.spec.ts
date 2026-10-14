import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../../utils/assertions';
import { TAGS, VISA_CARD } from '../../../utils/constants';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { getCardNumberLast4 } from '../../../utils/cards';

test.describe('Dropin - Remove stored payment method', () => {
    test(
        'Clicking "Remove" on a stored payment method shows the disable confirmation',
        { tag: [TAGS.SCREENSHOT] },
        async ({ dropinWithSession, page, browserName }) => {
            const url = getStoryUrl({
                baseUrl: URL_MAP.dropinWithSession,
                componentConfig: { showRemovePaymentMethodButton: true }
            });
            await dropinWithSession.goto(url);

            const { paymentMethodDetailsLocator } = await dropinWithSession.selectFirstStoredPaymentMethod(
                'Visa',
                getCardNumberLast4(VISA_CARD)
            );
            const paymentMethodItem = paymentMethodDetailsLocator.locator('..');

            const removeButton = paymentMethodItem.getByRole('button', { name: 'Remove' });
            await removeButton.click();
            await expect(removeButton).toHaveAttribute('aria-expanded', 'true');

            const confirmation = paymentMethodItem.locator('.adyen-checkout__payment-method__disable-confirmation--open');
            await expect(confirmation).toBeVisible();
            await expect(confirmation.getByRole('button', { name: 'Yes, remove' })).toBeVisible();
            await expect(confirmation.getByRole('button', { name: 'Cancel' })).toBeVisible();

            await toHaveScreenshot(paymentMethodItem, browserName, 'stored-pm-disable-confirmation.png');

            await confirmation.getByRole('button', { name: 'Cancel' }).click();
            await expect(confirmation).toBeHidden();
            await expect(removeButton).toHaveAttribute('aria-expanded', 'false');
        }
    );
});
