describe('UPI component', () => {
    describe('On mobile devices', () => {
        test('should always show the upi_qr as the second tab', () => {});
        test('should show upi_intent and upi_qr if there is an app list', () => {});
        test('should show upi_collect and upi_qr if there is not an app list', () => {});
    });

    describe('On large screen size devices', () => {
        test('should not show upi_intent', () => {});
        test('should always show upi_qr as the first tab', () => {});
        test('should show upi_qr and upi_collect', () => {});
    });

    describe('Upi intent', () => {
        test('should show a list of apps from the given appIds list', () => {});
        test('should show the corresponding logo and copy for each app', () => {});
        test('should show upi collect as the last option', () => {});
        test('should show a disabled Continue button if nothing is selected', () => {});
    });

    describe('Submit the payment', () => {
        describe('submit the upi intent', () => {
            test('should include the type and selected appId in the payment data', () => {});
        });
        describe('submit the upi collect', () => {
            test('should include the type and virtualPaymentAddress in the payment data', () => {});
        });
        describe('submit the upi qr', () => {
            test('should include the type in the payment data', () => {});
        });
    });
});
// todo: this test is for the dropin
describe('UPI in the dropin', () => {
    test('should only show one upi component if there are multiple upi sub variants returned', () => {});
});
