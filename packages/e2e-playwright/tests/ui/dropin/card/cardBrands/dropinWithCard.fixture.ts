import { test as base, expect } from '../../../../../fixtures/base-fixture';
import { DropinWithSession } from '../../../../../models/dropinWithSession';

// TODO: check this fixture/model
class DropinWithCard extends DropinWithSession {
    get card() {
        return super.getPaymentMethodLabelByType('scheme');
    }

    get visibleCardBrands() {
        return this.card.locator('.adyen-checkout__payment-method__brands').getByRole('img').all();
    }

    get remainingCardBrandsNumber() {
        return this.card.locator('.adyen-checkout__payment-method__brand-number');
    }
}

type Fixture = {
    dropinWithCard: DropinWithCard;
};

const test = base.extend<Fixture>({
    dropinWithCard: async ({ page }, use) => {
        const dropin = new DropinWithCard(page);
        await use(dropin);
    }
});

export { test, expect };
