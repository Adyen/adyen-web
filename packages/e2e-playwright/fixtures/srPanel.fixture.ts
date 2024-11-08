import { test as base, expect } from '@playwright/test';
import { SRPanel } from '../models/srPanel';

type Fixture = {
    srPanel: SRPanel;
};

const test = base.extend<Fixture>({
    srPanel: async ({ page }, use) => {
        await use(new SRPanel(page));
    }
});

export { test, expect };
