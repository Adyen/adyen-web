import { Locator, Page } from '@playwright/test';
import { capitalizeFirstLetter } from '../../lib/src/utils/textUtils';

const SELECT_YOUR_BANK = 'Select your Bank';
const TEST_BANK_NAME = 'TESTNL2A';

export const SIMULATION_TYPE_SUCCESS = 'SUCCESS';
export const SIMULATION_TYPE_FAILURE = 'FAILURE';

class Redirect {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly selectYourBankButton: Locator;
    readonly selectTestBankButton: Locator;
    readonly simulateSuccessButton: Locator;
    readonly simulateFailureButton: Locator;

    readonly page: Page;

    constructor(page: Page, rootElementSelector: string = '.redirect-field') {
        this.page = page;
        this.rootElement = page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.selectYourBankButton = page.getByRole('button', { name: SELECT_YOUR_BANK });

        this.selectTestBankButton = page.getByRole('button', { name: TEST_BANK_NAME });

        this.simulateSuccessButton = page.getByRole('button', { name: SIMULATION_TYPE_SUCCESS });
        this.simulateFailureButton = page.getByRole('button', { name: SIMULATION_TYPE_FAILURE });
    }

    async isComponentVisible() {
        await this.rootElement.waitFor({ state: 'visible' });
    }

    async isSelectYourBankVisible() {
        await this.selectYourBankButton.waitFor({ state: 'visible' });
    }

    async selectYourBank() {
        await this.selectYourBankButton.click();
    }

    async isSelectTestBankVisible() {
        await this.selectTestBankButton.scrollIntoViewIfNeeded();
        await this.selectTestBankButton.waitFor({ state: 'visible' });
    }
    async selectTestBank() {
        await this.selectTestBankButton.click();
    }

    async areSimulationButtonsVisible() {
        await this.simulateSuccessButton.waitFor({ state: 'visible' });
    }

    async selectSimulation(sim = SIMULATION_TYPE_SUCCESS) {
        let simType = sim.toLowerCase();
        simType = capitalizeFirstLetter(simType);
        await this[`simulate${simType}Button`].click();
    }
}

export { Redirect };
