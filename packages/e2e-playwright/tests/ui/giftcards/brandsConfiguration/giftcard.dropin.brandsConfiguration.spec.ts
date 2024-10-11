import { test } from '@playwright/test';
// todo: need to set up a fixture
/* Config used:
window.mainConfiguration = {
    allowPaymentMethods: ['giftcard']
};
window.dropinConfig = {
    paymentMethodsConfiguration: {
        giftcard: {
            brandsConfiguration: {
                genericgiftcard: {
                    icon: 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/logos/mc.svg',
                    name: 'Gifty mcGiftface'
                }
            }
        }
    }
};*/

test('#1 Check Giftcard comp receives custom name and icon from brandsConfiguration object', async t => {
    // Wait for el to appear in DOM
    // Expect to see Custom name
    // Expect to see Custom card icon
});
