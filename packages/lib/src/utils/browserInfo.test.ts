import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { ModuleKind, transpileModule } from 'typescript';
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

describe('collectBrowserInfo outside a browser', () => {
    /**
     * jsdom defines `window` as a non-configurable global, so it cannot be removed here. The module source is
     * evaluated instead in a fresh vm context, where `window` does not exist (as in SSR).
     */
    const loadWithoutWindow = () => {
        const source = readFileSync(join(__dirname, 'browserInfo.ts'), 'utf8');
        const { outputText } = transpileModule(source, { compilerOptions: { module: ModuleKind.CommonJS } });
        const moduleObject = { exports: { default: undefined } };
        const context = createContext({ module: moduleObject, exports: moduleObject.exports });
        runInContext(outputText, context);
        return { context, collect: moduleObject.exports.default };
    };

    test('should return undefined when window is not defined', () => {
        const { context, collect } = loadWithoutWindow();

        expect(runInContext('typeof window', context)).toBe('undefined');
        expect(typeof collect).toBe('function');

        let result: unknown = 'not called';
        expect(() => {
            result = collect();
        }).not.toThrow();
        expect(result).toBe(undefined);
    });
});
