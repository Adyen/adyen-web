import { Dropin } from './dropin';

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
}

export { DropinWithSession };
