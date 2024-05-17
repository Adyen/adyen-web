import { test, expect } from '../../pages/redirects/redirect.fixture';
import { SIMULATION_TYPE_FAILURE, SIMULATION_TYPE_SUCCESS } from '../../models/redirect';

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

        await redirectModel.selectSimulation(SIMULATION_TYPE_SUCCESS);

        await expect(page.locator('#result-message')).toHaveText('Authorised');
    });

    test('#2 Should fail in making an iDeal payment', async ({ redirectPageIdeal }) => {
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

        await redirectModel.selectSimulation(SIMULATION_TYPE_FAILURE);

        await expect(page.locator('#result-message')).toHaveText('Refused');
    });
});
