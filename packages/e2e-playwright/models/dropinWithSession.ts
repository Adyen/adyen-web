import { Dropin } from './dropin';

class DropinWithSession extends Dropin {
    async goto(url?: string) {
        await this.page.goto(url);
        const responsePromise = await this.page.waitForResponse(response => response.url().includes('/setup-session') && response.status() === 200);
        console.log(responsePromise.json());
        // this._paymentMethods = (await response.json()).paymentMethods.paymentMethods.map(({ name, type }: { name: string; type: string }) => ({
        //     name,
        //     type
        // }));
        await this.isComponentVisible();
    }
}

export { DropinWithSession };
