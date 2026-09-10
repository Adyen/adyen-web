import { test, expect } from '../../../../fixtures/dropin.fixture';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { getStoryUrl } from '../../../utils/getStoryUrl';
import { setupMock } from '../../../../mocks/setup/setup.mock';
import { setupWithGooglePayAsInstantMockData, setupWithGooglePayAsRegularMockData } from '../../../../mocks/setup/setup.data';
import LANG from '../../../../../server/translations/en-US.json';

test.describe('Dropin - Sessions - Custom display mode', () => {
    test('should render a payment method in the instant payments section', async ({ page, dropinWithSession }) => {
        await setupMock(page, setupWithGooglePayAsInstantMockData);

        await dropinWithSession.goto(getStoryUrl({ baseUrl: URL_MAP.dropinWithSession, componentConfig: { instantPaymentTypes: [] } }));

        await expect(dropinWithSession.instantPaymentMethodsList).toBeVisible();
        expect(await dropinWithSession.getInstantPaymentMethodTypes()).toEqual(['googlepay']);
        await expect(dropinWithSession.regularPaymentMethodsList.getByRole('radio', { name: 'Google Pay' })).toHaveCount(0);

        // The regular list is only labelled once it shares the Drop-in with the instant payments area
        await expect(dropinWithSession.rootElement.getByText(LANG['paymentMethodsList.otherPayments.label'])).toBeVisible();
        await expect(dropinWithSession.regularPaymentMethodsList.getByRole('radio')).toHaveText([/iDEAL/, /Credit Card/]);
    });

    test('should render a payment method in the regular list overriding instantPaymentTypes configuration', async ({
        page,
        dropinWithSession
    }) => {
        await setupMock(page, setupWithGooglePayAsRegularMockData);

        await dropinWithSession.goto(getStoryUrl({ baseUrl: URL_MAP.dropinWithSession, componentConfig: { instantPaymentTypes: ['googlepay'] } }));

        await expect(dropinWithSession.regularPaymentMethodsList.getByRole('radio')).toHaveText([/iDEAL/, /Google Pay/, /Credit Card/]);
        await expect(dropinWithSession.instantPaymentMethodsList).toHaveCount(0);
    });
});
