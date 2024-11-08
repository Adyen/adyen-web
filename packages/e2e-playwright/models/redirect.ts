import { Locator, Page } from '@playwright/test';
import { capitalizeFirstLetter } from '../../lib/src/utils/textUtils';
import { Base } from './base';

const SELECT_YOUR_BANK = 'Select your Bank';
const TEST_BANK_NAME = 'TESTNL2A';

export const SIMULATION_TYPE_SUCCESS = 'Success';
export const SIMULATION_TYPE_FAILURE = 'Failure';
export const SIMULATION_TYPE_EXPIRATION = 'Expiration';
export const SIMULATION_TYPE_CANCELLATION = 'Cancellation';

// todo: maybe consider changing the name to ideal, as it's iDeal specific
class Redirect extends Base {
    readonly rootElement: Locator;
    readonly rootElementSelector: string;

    readonly selectYourBankButton: Locator;
    readonly selectTestBankButton: Locator;
    readonly simulateSuccessButton: Locator;
    readonly simulateFailureButton: Locator;
    readonly simulateExpirationButton: Locator;
    readonly simulateCancellationButton: Locator;

    constructor(
        public readonly page: Page,
        rootElementSelector: string = '.component-wrapper'
    ) {
        super(page);
        this.rootElement = this.page.locator(rootElementSelector);
        this.rootElementSelector = rootElementSelector;

        this.selectYourBankButton = this.page.getByRole('button', { name: SELECT_YOUR_BANK });

        this.selectTestBankButton = this.page.getByText(TEST_BANK_NAME);

        this.simulateSuccessButton = this.page.getByRole('button', { name: SIMULATION_TYPE_SUCCESS });
        this.simulateFailureButton = this.page.getByRole('button', { name: SIMULATION_TYPE_FAILURE });
        this.simulateExpirationButton = this.page.getByRole('button', { name: SIMULATION_TYPE_EXPIRATION });
        this.simulateCancellationButton = this.page.getByRole('button', { name: SIMULATION_TYPE_CANCELLATION, exact: true });
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

    async redirect(options: { name?: RegExp | string } = { name: /Continue to iDEAL/i }) {
        await super.pay(options);
    }
}

export { Redirect };
