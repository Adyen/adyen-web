import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { Base } from '../../models/base';
import { Automated } from '../../models/automated';

const rawData = fs.readFileSync('../lib/storybook-static/index.json', { encoding: 'utf-8' });

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

let storyIds: string[] = [];

const index = JSON.parse(rawData) as StorybookIndex;
// Filter out non-story entries (like docs) and extract IDs
storyIds = Object.values(index.entries)
    .filter(entry => entry.type === 'story')
    .map(entry => entry.id);

test.describe('Automated a11y testing', () => {
    // Dynamically generate tests for each story
    for (const storyId of storyIds) {
        const testTitle = `A11y Check: ${storyId.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

        test(testTitle, async ({ page }) => {
            const storyUrl = `/iframe.html?id=${storyId}&viewMode=story`;

            const automatedModel = new Automated(page);
            await automatedModel.goto(storyUrl);

            const results = await automatedModel.getA11yErrors();
            expect(
                results.violations,
                `Accessibility violations found on story: ${storyId} (${storyUrl}) \nViolations:\n ${JSON.stringify(results.violations, null, 2)}` // Include violations in error message
            ).toEqual([]);
        });
    }

    test('Ensure Storybook stories were loaded', () => {
        if (storyIds.length === 0) {
            test.info().annotations.push({
                type: 'warning',
                description: `No Storybook stories were found or loaded from /index.json. Check the URL and ensure Storybook is running. The fetch attempt might have failed.`
            });
        }
        expect(storyIds.length).toBeGreaterThan(0);
    });
});
