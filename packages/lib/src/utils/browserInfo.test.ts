import collectBrowserInfo from './browserInfo';

describe('retrieving browser info from browser should', () => {
    test('match expected elements', () => {
        Object.defineProperty(window, 'screen', {
            configurable: true,
            value: {
                ...window.screen,
                height: 500,
                width: 1000,
                colorDepth: 24
            }
        });

        const browserInfo = collectBrowserInfo();

        expect(browserInfo.colorDepth).toEqual(expect.any(Number));
        expect(browserInfo.javaEnabled).toEqual(expect.any(Boolean));
        expect(browserInfo.language).toEqual(expect.any(String));
        expect(browserInfo.screenHeight).toEqual(500);
        expect(browserInfo.screenWidth).toEqual(1000);
        expect(browserInfo.timeZoneOffset).toEqual(expect.any(Number));
        expect(browserInfo.userAgent).toEqual(expect.any(String));
    });
});
