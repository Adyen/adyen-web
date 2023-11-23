import { Locator } from '@playwright/test';

export const getImageCount = async (who: Locator) => {
    return await who.getByRole('img').count();
};
