import { Card } from './card';

class BCMC extends Card {
    override async isComponentVisible() {
        await this.cardNumberInput.waitFor({ state: 'visible' });
        await this.expiryDateInput.waitFor({ state: 'visible' });
    }
}

export { BCMC };
