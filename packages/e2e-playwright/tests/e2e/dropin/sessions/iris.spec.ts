import { test, expect } from '../../../../fixtures/dropin.fixture';
import { TAGS } from '../../../utils/constants';
import { URL_MAP } from '../../../../fixtures/URL_MAP';
import { toHaveScreenshot } from '../../../utils/assertions';
import { Iris } from '../../../../models/iris';

test.describe('Dropin - Sessions - IRIS', () => {
    test.describe('QR Code Flow', () => {
        test(
            'Bank List Flow - should select issuer from the list, make payment',
            { tag: [TAGS.SCREENSHOT] },
            async ({ dropinWithSession, browserName, page }) => {
                await dropinWithSession.goto(URL_MAP.dropinSessionsGreece);

                await dropinWithSession.selectNonStoredPaymentMethod('iris');

                const iris = new Iris(page);

                await iris.switchToBankListMode();
                expect(await iris.isBankListModeSelected()).toBe(true);

                await iris.selectIssuerOnSelectorDropdown('Piraeus Bank');

                await iris.pay();

                await toHaveScreenshot(iris.rootElement, browserName, 'iris-bank-list-pay-button-clicked.png');

                await expect(page).not.toHaveURL(URL_MAP.dropinSessionsGreece, { timeout: 5000 });
            }
        );
    });
});
