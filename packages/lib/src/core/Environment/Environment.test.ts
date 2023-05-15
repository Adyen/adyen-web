import { resolveEnvironment } from './Environment';

describe('Environment', () => {
    test('resolves set environments', () => {
        expect(resolveEnvironment('test')).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('live')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('resolves a URL environment', () => {
        expect(resolveEnvironment('https://example.com/')).toBe('https://example.com/');
    });

    test('resolves to the live environment as a fallback', () => {
        expect(resolveEnvironment()).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });
});
