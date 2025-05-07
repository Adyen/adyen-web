import { Page } from '@playwright/test';
import { Card } from './card';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

class CardWithFastlane extends Card {
    constructor(page: Page) {
        super(page);
    }

    get fastlaneElement() {
        return this.page.getByTestId('fastlane-signup-component');
    }

    get fastlaneSignupToggle() {
        return this.fastlaneElement.getByRole('switch');
    }

    get mobileNumberInput() {
        return this.fastlaneElement.getByLabel('Mobile number');
    }

    async typeMobileNumber(number: string) {
        return this.mobileNumberInput.pressSequentially(number, { delay: USER_TYPE_DELAY });
    }
}

export { CardWithFastlane };
