import { test as base, expect } from './base-fixture';
import { Redirect } from '../models/redirect';
import { URL_MAP } from './URL_MAP';

type Fixture = {
    ideal: Redirect;
};

const test = base.extend<Fixture>({
    ideal: async ({ page }, use) => {
        const redirect = new Redirect(page);
        await redirect.goto(URL_MAP.ideal);
        await use(redirect);
    }
});

export { test, expect };
