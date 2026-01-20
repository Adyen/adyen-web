import { Locator, expect } from '@playwright/test';
import * as os from 'os';

const isCI = process.env.CI === 'true';
const isLinux = os.platform() === 'linux';

export const toHaveScreenshot = (
    locator: Locator,
    browserName: 'chromium' | 'firefox' | 'webkit',
    name: string | ReadonlyArray<string>,
    options?: {
        /**
         * When set to `"disabled"`, stops CSS animations, CSS transitions and Web Animations. Animations get different
         * treatment depending on their duration:
         * - finite animations are fast-forwarded to completion, so they'll fire `transitionend` event.
         * - infinite animations are canceled to initial state, and then played over after the screenshot.
         *
         * Defaults to `"disabled"` that disables animations.
         */
        animations?: 'disabled' | 'allow';

        /**
         * When set to `"hide"`, screenshot will hide text caret. When set to `"initial"`, text caret behavior will not be
         * changed.  Defaults to `"hide"`.
         */
        caret?: 'hide' | 'initial';

        /**
         * Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink
         * box `#FF00FF` (customized by
         * [`maskColor`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-1-option-mask-color))
         * that completely covers its bounding box.
         */
        mask?: Array<Locator>;

        /**
         * Specify the color of the overlay box for masked elements, in
         * [CSS color format](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). Default color is pink `#FF00FF`.
         */
        maskColor?: string;

        /**
         * An acceptable ratio of pixels that are different to the total amount of pixels, between `0` and `1`. Default is
         * configurable with `TestConfig.expect`. Unset by default.
         */
        maxDiffPixelRatio?: number;

        /**
         * An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`. Unset by
         * default.
         */
        maxDiffPixels?: number;

        /**
         * Hides default white background and allows capturing screenshots with transparency. Not applicable to `jpeg` images.
         * Defaults to `false`.
         */
        omitBackground?: boolean;

        /**
         * When set to `"css"`, screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this
         * will keep screenshots small. Using `"device"` option will produce a single pixel per each device pixel, so
         * screenshots of high-dpi devices will be twice as large or even larger.
         *
         * Defaults to `"css"`.
         */
        scale?: 'css' | 'device';

        /**
         * File name containing the stylesheet to apply while making the screenshot. This is where you can hide dynamic
         * elements, make elements invisible or change their properties to help you creating repeatable screenshots. This
         * stylesheet pierces the Shadow DOM and applies to the inner frames.
         */
        stylePath?: string | Array<string>;

        /**
         * An acceptable perceived color difference in the [YIQ color space](https://en.wikipedia.org/wiki/YIQ) between the
         * same pixel in compared images, between zero (strict) and one (lax), default is configurable with
         * `TestConfig.expect`. Defaults to `0.2`.
         */
        threshold?: number;

        /**
         * Time to retry the assertion for in milliseconds. Defaults to `timeout` in `TestConfig.expect`.
         */
        timeout?: number;
    }
): Promise<void> => {
    if (!isLinux || (browserName !== 'chromium' && !isCI)) {
        console.log('Skipping screenshot assertion', { os: os.platform(), browserName, isCI });
        return;
    }

    return expect(locator).toHaveScreenshot(name, { ...options });
};
