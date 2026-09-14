import type { Klarna, KlarnaSdkConfig, KlarnaSdkFactory } from '../klarna-web-sdk-types';

/**
 * Klarna forbids self-hosting or bundling the Web SDK: it must always be fetched from their CDN.
 * @see https://docs.klarna.com/klarna-network-distribution/
 */
const KLARNA_WEB_SDK_URL = 'https://js.klarna.com/web-sdk/v2/klarna.mjs';

export async function loadKlarnaSdk(config: KlarnaSdkConfig): Promise<Klarna> {
    // The URL is held in a variable so that neither webpack, Vite nor Rollup try to resolve it at
    // build time: Klarna requires the module to be fetched from their CDN at runtime.
    const url = KLARNA_WEB_SDK_URL;
    const { KlarnaSDK } = (await import(/* webpackIgnore: true */ /* @vite-ignore */ url)) as { KlarnaSDK: KlarnaSdkFactory };

    return KlarnaSDK(config);
}
