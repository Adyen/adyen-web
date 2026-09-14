import { loadKlarnaWebSdk } from './load-klarna-web-sdk';
import type { Klarna, KlarnaSdkConfig } from '../klarna-web-sdk-types';

const sdkInstanceCache = new Map<string, Promise<Klarna>>();

function getCacheKey(config: KlarnaSdkConfig): string {
    return [config.clientId, config.partnerAccountId, config.acquiringConfig?.paymentAccountId, config.locale, config.klarnaNetworkSessionToken]
        .map(value => value ?? '')
        .join('|');
}

/**
 * Resolves a `Klarna` instance, reusing it across mounts with the same configuration so that
 * Drop-in re-selections and remounts do not trigger a new SDK initialisation.
 */
export function getKlarnaSdkInstance(config: KlarnaSdkConfig, sdkUrl?: string): Promise<Klarna> {
    const key = getCacheKey(config);
    const cached = sdkInstanceCache.get(key);
    if (cached !== undefined) return cached;

    const instance = loadKlarnaWebSdk(sdkUrl).then(KlarnaSDK => KlarnaSDK(config));

    sdkInstanceCache.set(key, instance);
    void instance.catch(() => sdkInstanceCache.delete(key));

    return instance;
}

/** Test helper. */
export function clearKlarnaSdkInstanceCache(): void {
    sdkInstanceCache.clear();
}
