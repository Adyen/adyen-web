import type { PlaywrightTestConfig } from '@playwright/test';
import defaultConfig from './playwright.config';

/**
 * Configuration specific for automated tests
 */
const config: PlaywrightTestConfig = {
    ...defaultConfig,
    // Only target the automated visual test directory
    testDir: './tests/automated/visual',
    testIgnore: [],
    projects: defaultConfig.projects?.filter(project => project.name === 'chromium')
};

export default config;
