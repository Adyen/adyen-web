import { test as base, expect } from '@playwright/test';

const test = base.extend({}
    // keepig empty, all stories already use this base fixture
);

export { test, expect };
