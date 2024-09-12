import { KEYBOARD_DELAY } from './constants';

export const pressKeyboardToNextItem = async page => {
    await page.keyboard.press('ArrowDown', { delay: KEYBOARD_DELAY });
};

export const pressKeyboardToPreviousItem = async page => {
    await page.keyboard.press('ArrowUp', { delay: KEYBOARD_DELAY });
};

export const pressEnter = async page => {
    await page.keyboard.press('Enter', { delay: KEYBOARD_DELAY });
};
