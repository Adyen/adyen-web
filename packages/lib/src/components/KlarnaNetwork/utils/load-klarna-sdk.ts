import type { Klarna, KlarnaSdkConfig, KlarnaSdkFactory } from '../klarna-web-sdk-types';

const KLARNA_WEB_SDK_URL = 'https://js.klarna.com/web-sdk/v2/klarna.mjs';

export async function loadKlarnaSdk(config: KlarnaSdkConfig): Promise<Klarna> {
    const url = KLARNA_WEB_SDK_URL;
    const { KlarnaSDK } = (await import(/* webpackIgnore: true */ /* @vite-ignore */ url)) as { KlarnaSDK: KlarnaSdkFactory };

    return KlarnaSDK(config);
}
