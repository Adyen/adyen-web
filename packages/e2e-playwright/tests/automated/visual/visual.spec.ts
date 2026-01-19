import { test, expect } from '../../../fixtures/base-fixture';
import fs from 'node:fs';

// Config
// This is relative to playwright root: adyen-web/lib/e2e-playwright/
const STORYBOOK_INDEX_PATH = '../lib/storybook-static/index.json';

// types
interface StorybookIndex {
    v: number;
    entries: {
        [id: string]: {
            id: string;
            title: string;
            name: string;
            importPath: string;
            type: 'story' | 'docs';
            tags: string[];
        };
    };
}

const rawData = fs.readFileSync(STORYBOOK_INDEX_PATH, { encoding: 'utf-8' });
const index = JSON.parse(rawData) as StorybookIndex;

const allEntries = Object.values(index.entries);

// Filter out non-story entries, docs, and explicitly excluded stories
const storyIds = allEntries
    .filter(
        entry =>
            entry.type === 'story' &&
            !entry.id.includes('dropin') &&
            !entry.id.includes('internal') &&
            !entry.id.includes('applepay') &&
            !entry.id.includes('amazonpay') &&
            !entry.id.includes('paybybankpix') &&
            !entry.id.includes('clicktopay') &&
            !entry.id.includes('paypal--express') &&
            !entry.id.includes('fastlane--lookup') &&
            !entry.id.includes('components-cards--card-with-3-ds-2-create-from-action') &&
            !entry.id.includes('helpers')
    )
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

        test(testTitle, async ({ page }) => {
            const storyUrl = getStoryUrl(storyId);

            // Create tests model
            await page.goto(storyUrl);
            await expect(page.getByTestId('checkout-component-spinner')).toBeVisible();
            await expect(page.getByTestId('checkout-component-spinner')).toBeHidden();
            if (!storyId.includes('await')) {
                await expect(page.getByTestId('spinner')).toBeHidden();
            }
            await expect(page.getByTestId('checkout-component')).toHaveScreenshot(`${storyId}.png`, {
                mask: [page.getByRole('timer'), page.getByTestId('stored-card-info')]
            });
        });
    }
});
