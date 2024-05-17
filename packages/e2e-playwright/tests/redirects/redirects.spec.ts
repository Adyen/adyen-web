import { test, expect } from '../../pages/redirects/redirect.fixture';
// import { typeIntoSecuredField } from '../../models/utils';
// import { REGULAR_TEST_CARD, TEST_CVC_VALUE, TEST_DATE_VALUE } from '../utils/constants';

test.describe('Redirects', () => {
    test('#1 Should succeed in making an iDeal payment', async ({ redirectPageIdeal }) => {
        const { redirectModel, page } = redirectPageIdeal;

        await redirectModel.isComponentVisible();

        // press our redirect button
        await redirectPageIdeal.redirect();

        // wait for iDeal redirect page to show "Select your bank" option, then press it
        await redirectModel.isSelectYourBankVisible();

        await redirectModel.selectYourBank();

        // wait for iDeal redirect page to give option to choose the test bank
        await redirectModel.isSelectTestBankVisible();

        await redirectModel.selectTestBank();

        // Select chosen simulation
        await redirectModel.areSimulationButtonsVisible();

        await redirectModel.selectSimulation();

        await page.waitForTimeout(30000);
    });
});
