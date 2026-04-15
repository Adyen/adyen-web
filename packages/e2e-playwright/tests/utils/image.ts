import { expect, Locator, Page } from '@playwright/test';

export const getImageCount = async (who: Locator) => {
    return await who.getByRole('img').count();
};

/**
 * Waits until every image on the page (or within a locator scope) has fully
 * loaded by asserting that its computed opacity is '1'. Each assertion auto-retries
 * and all images are checked concurrently via Promise.all.
 */
export const waitForImageLoaded = async (scope: Page | Locator) => {
    const images = await scope.getByRole('img').all();
    await Promise.all(images.map(img => expect(img).toHaveCSS('opacity', '1')));
};
