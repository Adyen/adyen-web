import { Page } from '@playwright/test';
import { KEYBOARD_DELAY } from './constants';

export const pressKeyboardToNextItem = async (page: Page) => {
    await page.keyboard.press('ArrowDown', { delay: KEYBOARD_DELAY });
};

export const pressKeyboardToPreviousItem = async (page: Page) => {
    await page.keyboard.press('ArrowUp', { delay: KEYBOARD_DELAY });
};

export const pressKeyboardToSelectItem = async (page: Page) => {
    await page.keyboard.press('Enter', { delay: KEYBOARD_DELAY });
};
