import { test, expect } from '../../pages/redirects/redirect.fixture';
import { SIMULATION_TYPE_CANCELLATION, SIMULATION_TYPE_EXPIRATION, SIMULATION_TYPE_FAILURE, SIMULATION_TYPE_SUCCESS } from '../../models/redirect';

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

        // allow time for the details call
        await redirectModel.isMessageVisible();

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

        // allow time for the details call
        await redirectModel.isMessageVisible();

        await expect(page.locator('#result-message')).toHaveText('Refused');
    });

    test('#3 Should timeout in making an iDeal payment', async ({ redirectPageIdeal }) => {
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

        await redirectModel.selectSimulation(SIMULATION_TYPE_EXPIRATION);

        // allow time for the details call
        await redirectModel.isMessageVisible();

        await expect(page.locator('#result-message')).toHaveText('Received');
    });

    test('#4 Should cancel an iDeal payment', async ({ redirectPageIdeal }) => {
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

        await redirectModel.selectSimulation(SIMULATION_TYPE_CANCELLATION);

        // allow time for the details call
        await redirectModel.isMessageVisible();

        await expect(page.locator('#result-message')).toHaveText('Cancelled');
    });
});
