import { test, expect } from '../../../fixtures/issuer-list.fixture';
import { URL_MAP } from '../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../utils/assertions';
import { TAGS } from '../../utils/constants';

test.describe('IRIS Payment Method', () => {
    test(
        'Bank List Flow - should select issuer from the list, make payment, and return redirect action',
        { tag: [TAGS.SCREENSHOT] },
        async ({ iris, browserName }) => {
            await iris.switchToBankListMode();
            expect(await iris.isBankListModeSelected()).toBe(true);

            await toHaveScreenshot(iris.rootElement, browserName, 'iris-bank-list-mode.png');

            // The combobox should be visible in Bank List mode
            await expect(iris.selectorCombobox).toBeVisible();

            // Select an issuer from the dropdown (opens the listbox)
            await iris.selectIssuerOnSelectorDropdown('Piraeus Bank');

            await toHaveScreenshot(iris.rootElement, browserName, 'iris-bank-list-selected.png');

            await iris.pay();

            await expect(iris.page).not.toHaveURL(URL_MAP.iris, { timeout: 5000 });
        }
    );
    test.skip(
        'QR Code Flow - should display QR code image and data after generating',
        { tag: [TAGS.SCREENSHOT] },
        async ({ page, iris, browserName }) => {
            await iris.switchToQrCodeMode();
            expect(await iris.isQrCodeModeSelected()).toBe(true);
            await expect(iris.generateQrCodeButton).toBeVisible();

            await toHaveScreenshot(iris.generateQrCodeContainer, browserName, 'iris-qr-code-mode.png');

            await iris.generateQrCode();

            // Wait for and verify QR code image is displayed
            await iris.waitForQrCode();
            await expect(iris.qrCodeImage).toBeVisible();

            await toHaveScreenshot(iris.qrCodeContainer, browserName, 'iris-qr-code-generated.png', {
                mask: [page.getByRole('timer'), page.getByTestId('iris-qr-image')]
            });
        }
    );
});
