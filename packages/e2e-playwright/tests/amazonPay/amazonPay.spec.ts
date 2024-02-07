import { test, expect } from '../../pages/amazonPay/amazonPay.fixture';

test.describe('AmazonPay', () => {
    test('should render the AmazonPay button', async ({ amazonPayPage }) => {
        const { amazonPay, page } = amazonPayPage;

        await expect(page.locator('#result-message')).toHaveText('Partially Authorised');
    });
});
