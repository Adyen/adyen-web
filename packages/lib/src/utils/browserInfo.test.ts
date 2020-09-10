import collectBrowserInfo from './browserInfo';

describe('retrieving browser info from browser should', () => {
    test('match expected elements', () => {
        const browserInfo = collectBrowserInfo();

        expect(browserInfo.colorDepth).toEqual(expect.any(Number));
        expect(browserInfo.javaEnabled).toEqual(expect.any(Boolean));
        expect(browserInfo.language).toEqual(expect.any(String));
        expect(browserInfo.screenHeight).toEqual('');
        expect(browserInfo.screenWidth).toEqual('');
        expect(browserInfo.timeZoneOffset).toEqual(expect.any(Number));
        expect(browserInfo.userAgent).toEqual(expect.any(String));
    });
});
