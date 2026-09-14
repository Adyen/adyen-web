import { KLARNA_WEB_SDK_URL } from '../constants';
import type { KlarnaSdkFactory } from '../klarna-web-sdk-types';

const sdkModuleCache = new Map<string, Promise<KlarnaSdkFactory>>();

/**
 * Fetches the `KlarnaSDK` factory from Klarna's CDN, caching one module promise per URL.
 */
export function loadKlarnaWebSdk(url: string = KLARNA_WEB_SDK_URL): Promise<KlarnaSdkFactory> {
    const cached = sdkModuleCache.get(url);
    if (cached !== undefined) return cached;

    // The URL is held in a variable and annotated so that neither webpack, Vite nor Rollup try to
    // resolve it at build time: Klarna requires the module to be fetched from their CDN at runtime.
    const modulePromise = import(/* webpackIgnore: true */ /* @vite-ignore */ url).then(
        (module: { KlarnaSDK: KlarnaSdkFactory }) => module.KlarnaSDK
    );

    sdkModuleCache.set(url, modulePromise);

    // A cached rejection would make every later mount fail without retrying the download.
    void modulePromise.catch(() => sdkModuleCache.delete(url));

    return modulePromise;
}

/** Test helper. */
export function clearKlarnaWebSdkCache(): void {
    sdkModuleCache.clear();
}
