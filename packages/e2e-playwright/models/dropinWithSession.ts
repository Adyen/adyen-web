import { Dropin } from './dropin';
import LANG from '../../server/translations/en-US.json';

class DropinWithSession extends Dropin {
    async goto(url?: string) {
        await this.page.goto(url);
        // Wait for payment methods from the setup call
        const regex = /\/checkoutshopper\/.*\/sessions/;
        const responsePromise = this.page.waitForResponse(response => regex.test(response.url()) && response.status() === 200);
        const response = await responsePromise;

        this._paymentMethods = (await response.json()).paymentMethods.paymentMethods.map(({ name, type }: { name: string; type: string }) => ({
            name,
            type
        }));

        this._storedPaymentMethods = (await response.json()).paymentMethods.storedPaymentMethods.map(
            ({ name, type, brand }: { name: string; type: string; brand: string }) => ({
                name,
                type,
                brand
            })
        );

        await this.isComponentVisible();
    }

    get donationComponent() {
        return this.page.locator('.adyen-checkout__adyen-giving');
    }

    getDonationAmountButtonByIndex(index: number) {
        return this.donationComponent.locator('.adyen-checkout__button').nth(index);
    }

    get donateButton() {
        return this.donationComponent.getByRole('button', { name: LANG['donateButton'] });
    }

    get donationSuccess() {
        return this.donationComponent.getByAltText(LANG['thanksForYourSupport']);
    }
}

export { DropinWithSession };
