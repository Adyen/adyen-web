import type { PlaywrightTestConfig } from '@playwright/test';
import defaultConfig from './playwright.config';

/**
 * Configuration specific for automated tests
 */
const config: PlaywrightTestConfig = {
    ...defaultConfig,
    // Only target the automated ally test directory
    testDir: './tests/automated/ally',
    testIgnore: []
};

export default config;
