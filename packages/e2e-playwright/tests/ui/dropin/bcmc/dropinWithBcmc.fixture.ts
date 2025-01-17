import { test as base, mergeTests, expect } from '@playwright/test';
import { DropinWithSession } from '../../../../models/dropinWithSession';
import { test as card } from '../../../../fixtures/card.fixture';

class DropinWithBcmc extends DropinWithSession {
    get bcmc() {
        return super.getPaymentMethodLabelByType('bcmc');
    }

    get visibleCardBrands() {
        return this.bcmc.locator('.adyen-checkout__payment-method__brands').getByRole('img').all();
    }
}

type Fixture = {
    dropinWithBcmc: DropinWithBcmc;
};

const dropin = base.extend<Fixture>({
    dropinWithBcmc: async ({ page }, use) => {
        const dropin = new DropinWithBcmc(page);
        await use(dropin);
    }
});

const test = mergeTests(card, dropin);

export { test, expect };
