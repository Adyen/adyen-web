/**
 * Spies on `window.location.assign` under jsdom v26+ (bundled with jest-environment-jsdom 30).
 *
 * jsdom follows the WHATWG HTML spec where `window.location` is `[Unforgeable]`: its properties
 * are non-configurable, so `Object.defineProperty(window, 'location', ...)` and
 * `jest.spyOn(window, 'location', 'get')` now throw ("Cannot redefine property: location").
 * To intercept navigation without touching production code we reach jsdom's internal
 * implementation object via its symbol key and spy on the underlying `assign` method.
 * This is the workaround documented in the Jest 30 migration notes (Known Issues).
 *
 * The returned spy is a no-op by default (suppressing jsdom's "Not implemented: navigation"
 * error). Restore it with `jest.restoreAllMocks()` in an `afterEach`.
 *
 * @returns the jest spy wrapping the internal `assign` method.
 */
export const mockLocationAssign = (): jest.SpyInstance => {
    const implSymbol = Reflect.ownKeys(window.location).find(key => typeof key === 'symbol') as symbol;
    const locationImpl = (window.location as unknown as Record<symbol, { assign: (url: string | URL) => void }>)[implSymbol];
    return jest.spyOn(locationImpl, 'assign').mockImplementation(() => {});
};
