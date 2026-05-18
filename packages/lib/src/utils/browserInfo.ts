import type { BrowserInfo } from '../types/global-types';

/**
 * Collects available frontend browser info and store it in the properties dictated by the EMVCo spec
 * (3DS_Spec_protocolAndCoreFny_v2-1_Oct2017.pdf)
 *
 * @example
 * ```js
 * const browserInfo = collectBrowserInfo();
 * ```
 *
 * @returns An object containing the retrieved browser properties
 */
export default function collectBrowserInfo(): BrowserInfo {
    if (typeof window === 'undefined') {
        return;
    }
    const colorDepth = window.screen.colorDepth;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    const userAgent = window.navigator.userAgent;

    const language = window.navigator.language || 'en';
    const timeZoneOffset = new Date().getTimezoneOffset();

    return {
        acceptHeader: '*/*',
        javaEnabled: false,
        colorDepth,
        language,
        screenHeight,
        screenWidth,
        userAgent,
        timeZoneOffset
    };
}
