import { test as base, expect } from '../../../../fixtures/base-fixture';
import { DropinWithSession } from '../../../../models/dropinWithSession';
import { test as card } from '../../../../fixtures/card.fixture';
import { mergeTests } from '@playwright/test';

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
