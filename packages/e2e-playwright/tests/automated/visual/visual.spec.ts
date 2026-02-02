import { test, expect } from '../../../fixtures/base-fixture';
import fs from 'node:fs';
import { toHaveScreenshot } from '../../utils/assertions';
import { StorybookIndex } from '../types';

// This is relative to playwright root: adyen-web/lib/e2e-playwright/
const STORYBOOK_INDEX_PATH = '../lib/storybook-static/index.json';

const EXCLUDED_STORIES: string[] = [
    /**
     * Demos
     */
    'demos-sessionpatching--with-dropin',
    'demos-sessionpatching--with-components'
];

const rawData = fs.readFileSync(STORYBOOK_INDEX_PATH, { encoding: 'utf-8' });
const index = JSON.parse(rawData) as StorybookIndex;

const allEntries = Object.values(index.entries);

// Filter out non-story entries, docs, and explicitly excluded stories
const storyIds = allEntries
    .filter(entry => entry.type === 'story' && !entry.tags.includes('no-automated-visual-test') && !EXCLUDED_STORIES.includes(entry.id))
    .map(entry => entry.id); // Extract the IDs

const getTestTitle = (storyId: string) => {
    return `Visual Test: ${storyId.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
};

const getStoryUrl = (storyId: string) => {
    return `/iframe.html?id=${storyId}&viewMode=story`;
};

test.describe('Automated visual testing', () => {
    // Dynamically generate tests for each story
    for (const storyId of storyIds) {
        const testTitle = getTestTitle(storyId);

        test(testTitle, async ({ page, browserName }) => {
            const storyUrl = getStoryUrl(storyId);

            await page.goto(storyUrl);
            await expect(page.getByTestId('checkout-component-spinner')).toBeVisible();
            await expect(page.getByTestId('checkout-component-spinner')).toBeHidden();
            if (!storyId.includes('await')) {
                await expect(page.getByTestId('spinner')).toBeHidden();
            }
            await toHaveScreenshot(page.getByTestId('checkout-component'), browserName, `${storyId}.png`, {
                mask: [page.getByRole('timer'), page.getByTestId('stored-card-info')]
            });
        });
    }
});
