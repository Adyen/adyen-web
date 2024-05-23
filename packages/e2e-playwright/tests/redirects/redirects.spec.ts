import { test, expect } from '../../pages/redirects/redirect.fixture';
import { SIMULATION_TYPE_CANCELLATION, SIMULATION_TYPE_EXPIRATION, SIMULATION_TYPE_FAILURE, SIMULATION_TYPE_SUCCESS } from '../../models/redirect';

// const WAIT_FOR_SIMULATOR_MS = 2000;

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

        // Inspect iDeal simulator page for expected outcome
        await expect(page.getByText('SUCCESS', { exact: true })).toBeVisible();

        /**
         * The time that the simulator takes to complete varies massively, meaning the test can often timeout,
         * so we only try the full Redirect with /details call in one test
         */

        // allow time for the iDeal simulator to complete
        // await page.waitForTimeout(WAIT_FOR_SIMULATOR_MS);
        //
        // // allow time for the details call
        // await redirectModel.isMessageVisible();
        //
        // await expect(page.locator('#result-message')).toHaveText('Authorised');
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

        // Inspect iDeal simulator page for expected outcome
        await expect(page.getByText('FAILURE', { exact: true })).toBeVisible();

        // translates to a 'Refused' response from the /details call
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

        // Inspect iDeal simulator page for expected outcome
        await expect(page.getByText('TIMEOUT', { exact: true })).toBeVisible();

        // translates to a 'Received' response from the /details call
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

        // Inspect iDeal simulator page for expected outcome
        await expect(page.getByText('CANCEL', { exact: true })).toBeVisible();

        // translates to a 'Cancelled' response from the /details call
    });
});
